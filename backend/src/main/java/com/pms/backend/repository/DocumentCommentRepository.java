package com.pms.backend.repository;

import com.pms.backend.entity.DocumentComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentCommentRepository extends JpaRepository<DocumentComment, Integer> {
    List<DocumentComment> findByDocumentId(Integer documentId);
}