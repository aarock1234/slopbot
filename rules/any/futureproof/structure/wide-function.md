---
severity: minor
detect: ast
ast:
    ts:
        utils:
            param:
                any:
                    - kind: required_parameter
                    - kind: optional_parameter
        rule:
            any:
                - all:
                      - any:
                            - kind: function_declaration
                            - kind: method_definition
                            - kind: function_expression
                            - kind: arrow_function
                      - regex: '^(?:[^\n]*\n){60}'
                - kind: formal_parameters
                  has:
                      matches: param
                      follows:
                          matches: param
                          stopBy: end
                          follows:
                              matches: param
                              stopBy: end
                              follows:
                                  matches: param
                                  stopBy: end
                                  follows:
                                      matches: param
                                      stopBy: end
                                      follows:
                                          matches: param
                                          stopBy: end
    go:
        utils:
            param:
                kind: parameter_declaration
        rule:
            any:
                - all:
                      - any:
                            - kind: function_declaration
                            - kind: method_declaration
                            - kind: func_literal
                      - regex: '^(?:[^\n]*\n){60}'
                - kind: parameter_list
                  not:
                      follows:
                          kind: parameter_list
                  has:
                      matches: param
                      follows:
                          matches: param
                          stopBy: end
                          follows:
                              matches: param
                              stopBy: end
                              follows:
                                  matches: param
                                  stopBy: end
                                  follows:
                                      matches: param
                                      stopBy: end
                                      follows:
                                          matches: param
                                          stopBy: end
ignore:
    - '**/*.test.ts'
    - '**/*.spec.ts'
    - '**/*_test.go'
---

## Why

A function with six or more parameters or more than sixty lines is doing several jobs, and each new requirement makes it longer and its call sites more fragile, since positional arguments are easy to swap and impossible to read. Group related parameters into a typed options object or struct, and split the body along the steps it already performs. The pieces get names, tests, and a chance of being reused.

## Message

function is too wide: more than 5 parameters or over 60 lines; group parameters into a struct and split the body

## Bad

```ts
// BAD: six positional arguments nobody can order from memory
export function createInvoice(
	customerId: string,
	items: LineItem[],
	currency: string,
	dueDate: Date,
	notes: string,
	sendEmail: boolean
): Invoice {
	return build(customerId, items, currency, dueDate, notes, sendEmail);
}
```

```go
// BAD: six positional arguments nobody can order from memory
func CreateInvoice(customerID string, items []LineItem, currency string, dueDate time.Time, notes string, sendEmail bool) Invoice {
	return build(customerID, items, currency, dueDate, notes, sendEmail)
}
```

## Good

```ts
type CreateInvoiceInput = {
	customerId: string;
	items: LineItem[];
	currency: string;
	dueDate: Date;
	notes?: string;
	sendEmail?: boolean;
};

export function createInvoice(input: CreateInvoiceInput): Invoice {
	return build(input);
}
```

```go
type CreateInvoiceInput struct {
	CustomerID string
	Items      []LineItem
	Currency   string
	DueDate    time.Time
	Notes      string
	SendEmail  bool
}

func CreateInvoice(in CreateInvoiceInput) Invoice {
	return build(in)
}
```
