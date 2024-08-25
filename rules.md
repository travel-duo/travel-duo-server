# Claude Project Controller 및 Service 규칙서

## 1. Controller 규칙

### 1.1 구조 및 데코레이터

- @Controller 데코레이터를 사용하여 경로와 버전을 지정합니다.
  typescript
  @Controller({
  path: 'users',
  version: '1',
  })

- @ApiBearerAuth('access-token') 데코레이터로 Swagger 인증을 설정합니다.
- @UseGuards(JwtAuthGuard)로 JWT 인증을 적용합니다.
- @ApiTags로 Swagger 문서화 태그를 지정합니다.

### 1.2 메서드 및 엔드포인트

- RESTful 원칙을 따라 HTTP 메서드(GET, POST, PUT, DELETE)를 사용합니다.
- 각 메서드에 @ApiOperation으로 작업 설명을 추가합니다.
- @ApiResponse로 응답 상태와 설명을 문서화합니다.

### 1.3 파라미터 처리

- 경로 파라미터는 @Param 데코레이터를 사용하고, ParseIntPipe로 타입을 보장합니다.
- 쿼리 파라미터는 @Query 데코레이터를 사용합니다.
- 요청 본문은 @Body 데코레이터로 처리합니다.

### 1.4 권한 관리

- 필요에 따라 @UseGuards를 사용하여 추가적인 권한 검사를 수행합니다. (예: AdminGuard, ClassroomOwnerGuard)

### 1.5 에러 처리

- 적절한 HTTP 예외를 발생시킵니다. (예: NotFoundException)

### 1.6 응답 형식

- 페이지네이션이 필요한 경우 SearchResponseDto<T>를 반환합니다.
- 단일 엔티티 조회 시 해당 엔티티 타입을 반환합니다.

## 2. Service 규칙

### 2.1 구조

- @Injectable() 데코레이터를 사용하여 서비스를 정의합니다.
- 필요한 경우 SearchFilterService를 상속받아 검색 및 필터링 기능을 구현합니다.

### 2.2 의존성 주입

- @InjectRepository 데코레이터를 사용하여 필요한 레포지토리를 주입받습니다.

### 2.3 메서드 명명 규칙

- create: 새 엔티티 생성
- findOne: 단일 엔티티 조회
- findAll: 모든 엔티티 조회 (필터링, 페이지네이션, 정렬 포함)
- update: 엔티티 업데이트
- delete 또는 remove: 엔티티 삭제

### 2.4 검색 및 필터링

- searchAndPaginateResults 메서드를 사용하여 검색, 필터링, 페이지네이션을 구현합니다.
- getAllowedFields 메서드로 허용된 필드를 정의합니다.

### 2.5 에러 처리

- 엔티티를 찾지 못한 경우 NotFoundException을 발생시킵니다.

### 2.6 트랜잭션 처리

- 필요한 경우 여러 작업을 트랜잭션으로 묶어 처리합니다.

### 2.7 비즈니스 로직

- 복잡한 비즈니스 로직은 서비스 레이어에서 처리합니다.
- 컨트롤러는 가능한 한 간단하게 유지하고, 서비스 메서드를 호출하는 역할만 수행하도록 합니다.

## 3. 공통 규칙

### 3.1 코드 스타일

- 일관된 들여쓰기와 포매팅을 유지합니다.
- 의미 있는 변수명과 메서드명을 사용합니다.

### 3.2 문서화

- Swagger 데코레이터를 활용하여 API 문서를 자동으로 생성합니다.

### 3.3 타입 안정성

- TypeScript의 타입 시스템을 최대한 활용하여 타입 안정성을 보장합니다.
- any 타입 사용을 지양하고, 구체적인 타입이나 인터페이스를 정의하여 사용합니다.

### 3.4 보안

- 민감한 정보를 직접 코드에 하드코딩하지 않습니다.
- 사용자 입력은 항상 검증하고 살균(sanitize)합니다.

# Entity 규칙

## 1. 기본 구조

- 각 entity는 독립된 파일로 생성하며, 파일명은 `entity-name.entity.ts` 형식을 따릅니다.
- Entity 클래스에는 `@Entity()` 데코레이터를 사용하고, 테이블 이름을 명시합니다.
  ```typescript
  @Entity('table_name')
  export class EntityName {}
  ```

## 2. 속성 및 데코레이터

### 2.1 기본 키 (Primary Key)

- `@PrimaryGeneratedColumn({})` 데코레이터를 사용하여 자동 증가하는 기본 키를 정의합니다.
- 기본 키 컬럼명은 `_id`를 사용합니다.
  ```typescript
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  _id: number;
  ```

### 2.2 컬럼 정의

- `@Column()` 데코레이터를 사용하여 컬럼을 정의합니다.
- 컬럼의 타입, 길이, null 허용 여부 등을 명시합니다.
  ```typescript
  @Column({ length: 50, nullable: true })
  name: string;
  ```

### 2.3 관계 정의

- `@ManyToOne()`, `@OneToMany()`, `@OneToOne()`, `@ManyToMany()` 데코레이터를 사용하여 엔티티 간 관계를 정의합니다.
- 관계에 대한 조인 컬럼은 `@JoinColumn()` 데코레이터를 사용합니다.
  ```typescript
  @ManyToOne(() => User, (user) => user._id)
  @JoinColumn({ name: 'user_id' })
  user: User;
  ```

### 2.4 인덱스 및 유니크 제약 조건

- `@Index()` 데코레이터를 사용하여 인덱스를 정의합니다.
- `@Unique()` 데코레이터를 사용하여 유니크 제약 조건을 정의합니다.
  ```typescript
  @Index()
  @Column({ unique: true })
  email: string;
  ```

### 2.5 날짜 필드

- 생성 일시와 수정 일시는 `@CreateDateColumn()`과 `@UpdateDateColumn()` 데코레이터를 사용합니다.
  ```typescript
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  ```

## 3. 타입 및 enum 사용

- 가능한 경우 TypeScript의 타입 시스템을 활용합니다.
- enum 값은 별도의 파일로 분리하여 관리하고, 해당 enum을 import하여 사용합니다.
  ```typescript
  import { UserRole } from '../enums/user-role.enum';

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;
  ```

## 4. 데이터 변환 및 제외

- `class-transformer` 라이브러리의 데코레이터를 사용하여 데이터 변환 및 제외 로직을 구현합니다.
- 예: `@Exclude()` 데코레이터를 사용하여 비밀번호와 같은 민감한 정보를 응답에서 제외합니다.
  ```typescript
  import { Exclude } from 'class-transformer';

  @Column()
  @Exclude()
  password: string;
  ```

## 5. 유효성 검사

- `class-validator` 라이브러리의 데코레이터를 사용하여 데이터 유효성 검사 규칙을 정의합니다.
  ```typescript
  import { IsEmail, MinLength } from 'class-validator';

  @Column()
  @IsEmail()
  email: string;

  @Column()
  @MinLength(8)
  password: string;
  ```

## 7. 일관성 유지

- 명명 규칙, 들여쓰기, 데코레이터 사용 등에서 일관성을 유지합니다.
- 프로젝트 전반에 걸쳐 동일한 스타일과 패턴을 따릅니다.

이러한 규칙을 따르면 일관성 있고 유지보수가 용이한 entity를 작성할 수 있습니다. 프로젝트의 요구사항에 따라 이 규칙을 조정하거나 확장할 수 있습니다.

# DTO (Data Transfer Object) 규칙

## 1. 기본 구조

- 각 DTO는 독립된 파일로 생성하며, 파일명은 `purpose-entity-name.dto.ts` 형식을 따릅니다. (예: `create-user.dto.ts`, `update-post.dto.ts`)
- DTO 클래스 이름은 목적을 나타내는 동사로 시작하고 'Dto'로 끝납니다. (예: `CreateUserDto`, `UpdatePostDto`)

## 2. 속성 및 데코레이터

### 2.1 Swagger 문서화

- `@ApiProperty()` 데코레이터를 사용하여 각 속성을 Swagger 문서에 표시합니다.
- 속성의 설명, 예제, 필수 여부 등을 명시합니다.
  ```typescript
  @ApiProperty({
    description: '사용자 이름',
    example: 'John Doe',
    required: true
  })
  name: string;
  ```

### 2.2 유효성 검사

- `class-validator` 라이브러리의 데코레이터를 사용하여 유효성 검사 규칙을 정의합니다.
- 공통적으로 사용되는 유효성 검사 데코레이터:
    - `@IsNotEmpty()`, `@IsOptional()`: 필수 여부
    - `@IsString()`, `@IsNumber()`, `@IsBoolean()`: 타입 검사
    - `@IsEmail()`, `@IsUrl()`: 특정 형식 검사
    - `@MinLength()`, `@MaxLength()`, `@Min()`, `@Max()`: 길이 또는 값 범위 검사
    - `@IsEnum()`: enum 값 검사
  ```typescript
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;
  ```

### 2.3 타입 변환

- `class-transformer` 라이브러리의 데코레이터를 사용하여 데이터 타입을 변환합니다.
- `@Type()` 데코레이터를 사용하여 중첩된 객체나 배열의 타입을 지정합니다.
  ```typescript
  @Type(() => Number)
  @IsNumber()
  age: number;
  ```

## 3. 중첩 DTO 처리

- 복잡한 객체 구조의 경우, 중첩된 DTO를 사용합니다.
- 중첩된 객체에 대해 `@ValidateNested()` 데코레이터와 `@Type()` 데코레이터를 함께 사용합니다.
  ```typescript
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
  ```

## 4. 선택적 속성 처리

- 선택적 속성은 `?`를 사용하여 표시합니다.
- `@IsOptional()` 데코레이터를 사용하여 유효성 검사에서 선택적임을 나타냅니다.
  ```typescript
  @IsOptional()
  @IsString()
  middleName?: string;
  ```

## 5. 상속 및 확장

- 공통 속성을 가진 DTO들의 경우, 기본 DTO 클래스를 만들고 이를 확장하여 사용합니다.
  ```typescript
  export class BaseUserDto {
    @IsString()
    name: string;
  }

  export class CreateUserDto extends BaseUserDto {
    @IsEmail()
    email: string;
  }
  ```

## 6. enum 사용

- enum 값은 별도의 파일로 분리하여 관리하고, 해당 enum을 import하여 사용합니다.
- `@IsEnum()` 데코레이터를 사용하여 enum 값을 검증합니다.
  ```typescript
  import { UserRole } from '../enums/user-role.enum';

  @IsEnum(UserRole)
  role: UserRole;
  ```

## 7. 명명 규칙

- 속성 이름은 camelCase를 사용합니다.
- API 응답에서 다른 명명 규칙(예: snake_case)을 사용해야 하는 경우, `@ApiProperty()` 데코레이터의 `name` 옵션을 사용합니다.
  ```typescript
  @ApiProperty({ name: 'first_name' })
  firstName: string;
  ```

## 9. 일관성 유지

- 명명 규칙, 들여쓰기, 데코레이터 사용 등에서 일관성을 유지합니다.
- 프로젝트 전반에 걸쳐 동일한 스타일과 패턴을 따릅니다.

이러한 규칙을 따르면 일관성 있고 유지보수가 용이한 DTO를 작성할 수 있습니다. 프로젝트의 요구사항에 따라 이 규칙을 조정하거나 확장할 수 있습니다.