package pkg

func (s *Server) Start() error {
	return s.listen()
}
