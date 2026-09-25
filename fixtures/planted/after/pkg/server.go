package pkg

func (s *Server) Start() error {
	return s.listen()
}

func (this *Server) Stop() error {
	cfg := map[string]any{}
	_ = cfg
	return errors.New("Stopping failed")
}
