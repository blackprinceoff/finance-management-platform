package com.finance.platform.service;

import com.finance.platform.dto.CategoryRequest;
import com.finance.platform.dto.CategoryResponse;
import com.finance.platform.entity.Category;
import com.finance.platform.entity.User;
import com.finance.platform.exception.BadRequestException;
import com.finance.platform.exception.ResourceNotFoundException;
import com.finance.platform.exception.UnauthorizedException;
import com.finance.platform.repository.CategoryRepository;
import com.finance.platform.util.RoleConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getAllCategories(Long userId) {
        return categoryRepository.findByUserIdOrIsGlobal(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public CategoryResponse getCategoryById(Long id, Long userId) {
        Category category = findAccessibleCategory(id, userId);
        return toResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request, User currentUser) {
        if (request.isGlobal() && !isAdmin(currentUser)) {
            throw new UnauthorizedException("Only admins can create global categories");
        }

        Category category = Category.builder()
                .name(request.name())
                .type(request.type())
                .isGlobal(request.isGlobal())
                .user(request.isGlobal() ? null : currentUser)
                .build();

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request, User currentUser) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (category.isGlobal()) {
            if (!isAdmin(currentUser)) {
                throw new UnauthorizedException("Only admins can update global categories");
            }
        } else {
            if (!category.getUser().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You can only update your own categories");
            }
        }

        if (request.isGlobal() && !isAdmin(currentUser)) {
            throw new UnauthorizedException("Only admins can convert a category to global");
        }

        category.setName(request.name());
        category.setType(request.type());
        category.setGlobal(request.isGlobal());

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id, User currentUser) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (category.isGlobal()) {
            if (!isAdmin(currentUser)) {
                throw new UnauthorizedException("Only admins can delete global categories");
            }
        } else {
            if (!category.getUser().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You can only delete your own categories");
            }
        }

        categoryRepository.delete(category);
    }

    private Category findAccessibleCategory(Long id, Long userId) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (!category.isGlobal() && !category.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Category", "id", id);
        }

        return category;
    }

    private boolean isAdmin(User user) {
        return user.getRoles().stream()
                .anyMatch(role -> role.getName().equals(RoleConstants.ADMIN));
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getType(),
                category.isGlobal(),
                category.getUser() != null ? category.getUser().getId() : null
        );
    }
}
