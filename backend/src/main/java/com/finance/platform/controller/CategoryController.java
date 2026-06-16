package com.finance.platform.controller;

import com.finance.platform.dto.CategoryRequest;
import com.finance.platform.dto.CategoryResponse;
import com.finance.platform.entity.User;
import com.finance.platform.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(categoryService.getAllCategories(currentUser.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(categoryService.getCategoryById(id, currentUser.getId()));
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        User currentUser = getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoryService.createCategory(request, currentUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(categoryService.updateCategory(id, request, currentUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        categoryService.deleteCategory(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
