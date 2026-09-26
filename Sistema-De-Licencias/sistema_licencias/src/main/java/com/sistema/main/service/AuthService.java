package com.sistema.main.service;

import com.sistema.main.dto.LoginRequest;
import com.sistema.main.dto.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest loginRequest);
}
