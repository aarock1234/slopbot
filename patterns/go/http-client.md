# HTTP Client

A reusable HTTP client package built from functional options, a typed proxy configuration, and a generic top-level request helper in downstream packages.

## client.go

Functional options configure the client. Sensible defaults mean callers only override what they need.

```go
package client

// Client is an HTTP client with TLS fingerprinting, cookie handling,
// and proxy support.
type Client struct {
	http     *http.Client
	jar      *CookieJar
	proxy    *Proxy
	browser  Browser
	platform Platform
	// ...
}

// New creates a new Client with the given options.
func New(opts ...Option) (*Client, error) {
	c := &Client{
		browser:  BrowserChrome,
		platform: PlatformWindows,
		// sensible defaults...
	}

	for _, opt := range opts {
		opt(c)
	}

	// resolve TLS/HTTP2 profile from browser+platform, build transport...

	return c, nil
}

// Do sends an HTTP request. Redirects are followed manually so that
// Set-Cookie headers from intermediate responses are captured.
func (c *Client) Do(req *http.Request) (*http.Response, error) {
	// manual redirect loop with cookie capture
}
```

## option.go

One option per concern. Each returns an `Option` closure.

```go
package client

// Option configures a Client.
type Option func(*Client)

func WithProxy(p *Proxy) Option {
	return func(c *Client) { c.proxy = p }
}

func WithBrowser(b Browser) Option {
	return func(c *Client) { c.browser = b }
}

func WithPlatform(p Platform) Option {
	return func(c *Client) { c.platform = p }
}

func WithCookieExtractor(fn CookieExtractor) Option {
	return func(c *Client) { c.extractCookies = fn }
}

func WithDefaultHeaderOverrides(h http.Header) Option {
	return func(c *Client) { c.defaultHeaderOverrides = h.Clone() }
}
```

## proxy.go

Typed `Proxy` struct instead of raw `*url.URL`. Keeps host, port, credentials, and scheme separate for cleaner access and conversion.

```go
package client

// Proxy holds a parsed proxy configuration.
type Proxy struct {
	Scheme   ProxyScheme
	Host     string
	Port     string
	Username string
	Password string
}

// URL returns the proxy as a *url.URL suitable for http.Transport.Proxy.
func (p *Proxy) URL() *url.URL {
	u := &url.URL{
		Scheme: string(p.Scheme),
		Host:   p.Host + ":" + p.Port,
	}

	if p.Username != "" && p.Password != "" {
		u.User = url.UserPassword(p.Username, p.Password)
	}

	return u
}

// ParseProxy parses a "host:port" or "host:port:user:pass" string.
// An empty string returns (nil, nil).
func ParseProxy(proxy string, scheme ProxyScheme) (*Proxy, error) {
	proxy = strings.TrimSpace(proxy)
	if proxy == "" {
		return nil, nil
	}

	split := strings.Split(proxy, ":")
	if len(split) != 2 && len(split) != 4 {
		return nil, fmt.Errorf("got %d proxy parts, want 2 or 4: %v", len(split), split)
	}

	return &Proxy{
		Scheme: scheme,
		Host:   split[0],
		Port:   split[1],
		// username/password from split[2:4] if present
	}, nil
}

// ImportProxies reads proxy configs from a file, one per line.
func ImportProxies(filename string, scheme ProxyScheme) ([]*Proxy, error) {
	f, err := os.Open(filename)
	if err != nil {
		return nil, fmt.Errorf("opening proxy file: %w", err)
	}
	defer func() { _ = f.Close() }()

	var proxies []*Proxy
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}

		proxy, err := ParseProxy(line, scheme)
		if err != nil {
			return nil, fmt.Errorf("parsing proxy line %q: %w", line, err)
		}

		proxies = append(proxies, proxy)
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("scanning proxy file: %w", err)
	}

	return proxies, nil
}
```

## Usage

Downstream packages compose the client with the options they need.

```go
type APIClient struct {
	http    *client.Client
	baseURL string
}

func New(cfg *Config) (*APIClient, error) {
	var proxy client.Proxy
	if cfg.Proxy != "" {
		parsed, err := client.ParseProxy(cfg.Proxy, client.ProxySchemeHTTP)
		if err != nil {
			return nil, fmt.Errorf("parsing proxy: %w", err)
		}

		proxy = *parsed
	}

	opts := []client.Option{
		client.WithPlatform(client.PlatformWindows),
		client.WithCookieExtractor(customExtractor),
	}

	if cfg.Proxy != "" {
		opts = append(opts, client.WithProxy(&proxy))
	}

	httpClient, err := client.New(opts...)
	if err != nil {
		return nil, fmt.Errorf("creating http client: %w", err)
	}

	return &APIClient{
		http:    httpClient,
		baseURL: cfg.BaseURL,
	}, nil
}

// doRequest is a generic top-level function because Go does not support
// generic methods. This avoids `any` in the public API; the caller
// gets a fully typed *T back with no type assertions.
func doRequest[T any](ctx context.Context, c *APIClient, path string) (*T, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", c.baseURL+path, nil)
	if err != nil {
		return nil, fmt.Errorf("creating request: %w", err)
	}
	req.Header.Set("Accept", "application/json")

	res, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("executing request: %w", err)
	}
	defer func() { _ = res.Body.Close() }()

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %d", res.StatusCode)
	}

	var result T
	if err := json.NewDecoder(res.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decoding response: %w", err)
	}

	return &result, nil
}

// Usage
item, err := doRequest[Item](ctx, client, "/items/123")
```
