package com.gymx.api.user;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public Map<String,Object> getCurrentUser(Authentication authentication)
    {
        String email = authentication.getName();
        User user = userRepository.findByEmailIgnoreCase(email).orElseThrow(()->new ResponseStatusException(HttpStatus.BAD_REQUEST,"The User Email Is Not Found"));
        return Map.of("id", user.getId(), "UserName", user.getUserName() != null ? user.getUserName() : "", "email", user.getEmail());
    }

}
