---
title: "Mutation 조건부 패턴"
description: "조건부 mutation과 동적 옵션 선택을 컴포넌트 방식으로 구현해 Hooks 제약을 피하는 패턴입니다."
type: pattern
tags: [API, React, BestPractice]
order: 0
---

# Mutation 조건부 패턴

## 1. 해결하려는 문제

### 문제 1: 조건부 Mutation 사용 시 Rules of Hooks 위반

```typescript
// ❌ 조건부로 mutation을 사용하려고 하면 Rules of Hooks 위반
const PostEditForm = ({ post, canEdit }) => {
  // 🚨 ERROR: Hooks는 조건부로 사용할 수 없음
  if (canEdit) {
    const editMutation = useMutation(editPostMutationOptions(post.id)); // Rules of Hooks 위반!
    return <textarea onChange={e => editMutation.mutateAsync({ content: e.target.value })} />;
  }
  
  return <div>{post.content}</div>; // 읽기 전용
};

// ❌ 어쩔 수 없이 컴포넌트를 분리해야 함
const PostEditForm = ({ post, canEdit }) => {
  if (canEdit) {
    return <EditablePost post={post} />; // 별도 컴포넌트 필요
  }
  return <ReadOnlyPost post={post} />;
};

// 의미없는 wrapper 컴포넌트들
const EditablePost = ({ post }) => {
  const editMutation = useMutation(editPostMutationOptions(post.id));
  return <textarea onChange={e => editMutation.mutateAsync({ content: e.target.value })} />;
};

const ReadOnlyPost = ({ post }) => {
  return <div>{post.content}</div>;
};
```

### 문제 2: 조건에 따른 다른 Mutation 옵션 사용 시 Rules of Hooks 위반

```typescript
// ❌ 조건에 따라 다른 mutation을 사용하려고 하면 Rules of Hooks 위반
const FileUploadForm = ({ fileType, isPublic }) => {
  // 🚨 ERROR: Hooks는 조건부로 사용할 수 없음
  if (fileType === 'image') {
    const uploadMutation = useMutation(uploadImageMutationOptions); // Rules of Hooks 위반!
    return <ImageUploader onUpload={uploadMutation.mutateAsync} />;
  } else if (fileType === 'document') {
    const uploadMutation = useMutation(uploadDocumentMutationOptions); // Rules of Hooks 위반!
    return <DocumentUploader onUpload={uploadMutation.mutateAsync} />;
  }
  
  // 🚨 ERROR: 공개/비공개에 따른 다른 옵션도 조건부 사용 불가
  if (isPublic) {
    const publicUploadMutation = useMutation(publicUploadMutationOptions); // Rules of Hooks 위반!
    return <PublicUploader onUpload={publicUploadMutation.mutateAsync} />;
  }
  
  return <div>파일 타입을 선택하세요</div>;
};

// ❌ 어쩔 수 없이 여러 컴포넌트로 분리해야 함
const FileUploadForm = ({ fileType, isPublic }) => {
  if (fileType === 'image') {
    return <ImageUploadComponent isPublic={isPublic} />;
  } else if (fileType === 'document') {
    return <DocumentUploadComponent isPublic={isPublic} />;
  }
  
  return <div>파일 타입을 선택하세요</div>;
};
```

**문제 요약:** React hooks는 조건부/반복문에서 사용할 수 없어 조건에 따른 다른 mutation 옵션 사용이나 컴포넌트 분기 시 불필요한 wrapper 컴포넌트들을 생성해야 함

## 2. 해결 방법

### 해결 1: Mutation 컴포넌트로 조건부 사용 가능

```typescript
// ✅ Mutation 컴포넌트로 조건부 사용 가능
import { Mutation } from '@suspensive/react-query';

const PostEditForm = ({ post, canEdit }) => {
  if (canEdit) {
    // 🎯 조건부로 Mutation 컴포넌트 사용 가능 (Rules of Hooks 위반 없음)
    return (
      <Mutation {...editPostMutationOptions.external(post.id)}>
        {(editMutation) => (
          <>
            {editMutation.isLoading && <Spinner />}
            <textarea 
              defaultValue={post.content}
              onChange={e => editMutation.mutateAsync({ content: e.target.value })} 
            />
          </>
        )}
      </Mutation>
    );
  }
  
  return <div>{post.content}</div>; // 읽기 전용
};

// ✅ 불필요한 wrapper 컴포넌트들 제거됨
// EditablePost, ReadOnlyPost 컴포넌트가 더 이상 필요 없음
```

### 해결 2: 조건에 따른 다른 Mutation 옵션 사용

```typescript
// ✅ 조건에 따라 다른 Mutation 옵션을 자유롭게 사용 가능
import { Mutation } from '@suspensive/react-query';

const FileUploadForm = ({ fileType, isPublic }) => {
  // 🎯 조건에 따라 다른 mutationOptions 사용 가능 (Rules of Hooks 위반 없음)
  if (fileType === 'image') {
    return (
      <Mutation {...(isPublic ? publicImageUploadOptions.external() : privateImageUploadOptions.external())}>
        {(uploadMutation) => (
          <ImageUploader 
            onUpload={uploadMutation.mutateAsync}
            isUploading={uploadMutation.isLoading}
          />
        )}
      </Mutation>
    );
  }
  
  if (fileType === 'document') {
    return (
      <Mutation {...(isPublic ? publicDocumentUploadOptions.external() : privateDocumentUploadOptions.external())}>
        {(uploadMutation) => (
          <DocumentUploader 
            onUpload={uploadMutation.mutateAsync}
            isUploading={uploadMutation.isLoading}
          />
        )}
      </Mutation>
    );
  }
  
  return <div>파일 타입을 선택하세요</div>;
};

// ✅ 동적 mutation 옵션 선택도 가능
const DynamicUploadForm = ({ fileType, userRole, isPublic }) => {
  // 조건에 따라 동적으로 mutation 옵션 결정
  const getMutationOptions = () => {
    if (userRole === 'admin') {
      return adminUploadMutationOptions.external();
    }
    
    if (fileType === 'image') {
      return isPublic ? publicImageUploadOptions.external() : privateImageUploadOptions.external();
    }
    
    return basicUploadMutationOptions.external();
  };
  
  return (
    <Mutation {...getMutationOptions()}>
      {(uploadMutation) => (
        <FileUploader 
          onUpload={uploadMutation.mutateAsync}
          isUploading={uploadMutation.isLoading}
          fileType={fileType}
        />
      )}
    </Mutation>
  );
};
```

**해결 요약:** Mutation 컴포넌트는 조건부/반복문에서 자유롭게 사용 가능하며, 조건에 따라 다른 mutation 옵션을 동적으로 선택할 수 있어 복잡한 분기 로직도 단일 컴포넌트에서 처리 가능

## 3. 주의사항 (Caveat)

```typescript
// ❌ 과도한 Mutation 중첩
const ComplexForm = () => (
  <Mutation {...validateMutationOptions.external()}>
    {(validateMutation) => (
      <Mutation {...submitMutationOptions.external()}>
        {(submitMutation) => (
          <Mutation {...trackMutationOptions.external()}>
            {(trackMutation) => (
              // 너무 깊은 중첩
              <form>...</form>
            )}
          </Mutation>
        )}
      </Mutation>
    )}
  </Mutation>
);

// ✅ MSA 환경에서는 통합 fetch 함수로 해결
const submitWithValidationAndTracking = async (formData: FormData) => {
  // 프론트엔드에서 BFF 레이어 역할 수행
  const validationResponse = await api.validateForm(formData);
  if (!validationResponse.isValid) {
    throw new Error('폼 검증 실패');
  }
  
  const submitResponse = await api.submitForm(formData);
  await api.trackSubmission({ id: submitResponse.id });
  
  return submitResponse;
};

// 단일 Mutation으로 단순화
const ComplexForm = () => (
  <Mutation mutationFn={submitWithValidationAndTracking}>
    {(mutation) => (
      <form onSubmit={() => mutation.mutateAsync(formData)}>
        <Button loading={mutation.isLoading}>제출</Button>
      </form>
    )}
  </Mutation>
);
```

**주의사항 요약:** 3개 이상 중첩 시 MSA 환경에서는 통합 fetch 함수로 BFF 역할 수행하여 해결

## 4. 사용된 레퍼런스

### 실제 적용 사례 1 - 포스트 편집 기능

```typescript
// src/community/posts/post-list-page.tsx
const PostListPage = () => {
  const { data: posts } = useSuspenseQuery(postsQuery);
  
  return (
    <div>
      {posts.map(post => (
        <Mutation key={post.id} mutationOptions={editPostMutationOptions(post.id)}>
          {(editMutation) => (
            <PostItem 
              post={post}
              onEdit={editMutation.mutateAsync}
              isEditing={editMutation.isLoading}
            />
          )}
        </Mutation>
      ))}
    </div>
  );
};
```

### 실제 적용 사례 2 - 파일 업로드 기능

```typescript
// src/file-management/upload/file-upload-page.tsx
const FileUploadPage = ({ userRole, fileCategory }) => {
  const getMutationOptions = () => {
    // 사용자 역할에 따른 업로드 권한 분기
    if (userRole === 'admin') {
      return adminFileUploadMutationOptions.external();
    }
    
    // 파일 카테고리에 따른 처리 방식 분기
    switch (fileCategory) {
      case 'profile-image':
        return profileImageUploadMutationOptions.external();
      case 'document':
        return documentUploadMutationOptions.external();
      case 'media':
        return mediaUploadMutationOptions.external();
      default:
        return basicFileUploadMutationOptions.external();
    }
  };
  
  return (
    <Mutation {...getMutationOptions()}>
      {(uploadMutation) => (
        <FileDropzone 
          onUpload={uploadMutation.mutateAsync}
          isUploading={uploadMutation.isLoading}
          userRole={userRole}
          fileCategory={fileCategory}
        />
      )}
    </Mutation>
  );
};
```

## 5. 더 알아보기

### 권장 사용 시나리오
- 조건부 렌더링이 필요한 mutation
- 반복문 내에서 mutation이 필요한 경우
- **조건에 따라 다른 mutation 옵션을 사용해야 하는 경우**
- **사용자 권한/역할에 따른 다른 API 엔드포인트 호출**
- **파일 타입이나 데이터 형식에 따른 다른 처리 로직**
- wrapper 컴포넌트 생성을 피하고 싶은 경우

### 성능 고려사항
- 조건부 렌더링 시 불필요한 mutation 생성 방지
- 중첩 깊이를 적절히 제한하여 가독성 유지
- **동적 mutation 옵션 선택 시 함수 메모이제이션 고려**
- MSA 환경에서는 통합 fetch 함수 활용

### 동적 Mutation 옵션의 장점
- **단일 컴포넌트에서 복잡한 분기 로직 처리**
- **조건에 따른 다른 API 엔드포인트/설정 사용**
- **런타임에 mutation 동작 변경 가능**
- **코드 중복 없이 다양한 시나리오 대응**
