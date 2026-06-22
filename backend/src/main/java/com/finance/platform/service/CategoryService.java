package com.finance.platform.service;

import com.finance.platform.dto.CategoryRequest;
import com.finance.platform.dto.CategoryResponse;
import com.finance.platform.entity.Category;
import com.finance.platform.entity.User;
import com.finance.platform.exception.BadRequestException;
import com.finance.platform.exception.ResourceNotFoundException;
import com.finance.platform.exception.UnauthorizedException;
import com.finance.platform.repository.CategoryRepository;
import com.finance.platform.repository.UserRepository;
import com.finance.platform.repository.ExpenseRepository;
import com.finance.platform.repository.IncomeRepository;
import com.finance.platform.repository.BudgetRepository;
import com.finance.platform.security.UserPrincipal;
import com.finance.platform.util.RoleConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final BudgetRepository budgetRepository;

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
    public CategoryResponse createCategory(CategoryRequest request, UserPrincipal principal) {
        if (request.isGlobal() && !principal.hasRole(RoleConstants.ADMIN)) {
            throw new UnauthorizedException("Only admins can create global categories");
        }

        User userRef = request.isGlobal() ? null : userRepository.getReferenceById(principal.getId());

        Category category = Category.builder()
                .name(request.name())
                .type(request.type())
                .isGlobal(request.isGlobal())
                .user(userRef)
                .build();

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request, UserPrincipal principal) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (category.isGlobal()) {
            if (!principal.hasRole(RoleConstants.ADMIN)) {
                throw new UnauthorizedException("Only admins can update global categories");
            }
        } else {
            if (!category.getUser().getId().equals(principal.getId())) {
                throw new UnauthorizedException("You can only update your own categories");
            }
        }

        if (request.isGlobal() && !principal.hasRole(RoleConstants.ADMIN)) {
            throw new UnauthorizedException("Only admins can convert a category to global");
        }

        if (category.getType() != request.type()) {
            if (expenseRepository.existsByCategoryId(id) ||
                incomeRepository.existsByCategoryId(id) ||
                budgetRepository.existsByCategoryId(id)) {
                throw new BadRequestException("Cannot change category type because it is already linked to existing transactions or budgets");
            }
        }

        category.setName(request.name());
        category.setType(request.type());
        category.setGlobal(request.isGlobal());

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id, UserPrincipal principal) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (category.isGlobal()) {
            if (!principal.hasRole(RoleConstants.ADMIN)) {
                throw new UnauthorizedException("Only admins can delete global categories");
            }
        } else {
            if (!category.getUser().getId().equals(principal.getId())) {
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
