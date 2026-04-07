## Overview: Dưới đây là kế hoạch thực hiện assignment aws, nhằm mục tiêu hiểu cơ bản về AWS architecture
Bài assignment phù hợp cho người mới tiếp cận với AWS và mong muốn học thông qua mock project
---

### 🌟 BƯỚC 1: Xây dựng Kiến trúc Tổng thể & Trả lời các câu hỏi lý thuyết (Q2 - Q8)

**Hãy copy toàn bộ đoạn text dưới đây và gửi cho AI:**

> **Role:**
> Đóng vai là một Senior AWS Cloud Architect và DevOps Engineer. Tôi đang có một bài tập lớn về việc Migrate hệ thống từ On-Premises lên AWS.
> 
> **Context (Hệ thống On-premise hiện tại):**
> Hệ thống hiện tại có 2 Data Center (Corporate DC - Active và DR DC - Passive). 
> Các thành phần bao gồm:
> - External Interfaces gọi vào hệ thống qua RabbitMQ.
> - Database: SQL server (Active-Passive replication giữa 2 DC).
> - Compute: Các máy chủ ảo (VM) chạy nodejs API mid-tier.
> - Frontend: Reactjs.
> - Authentication: JWT.
> - DR: Replicate VMs và Database sang DR Data center.
>
> **Refactoring**:
> 1. Frontend: Chuyển từ Angular sang **ReactJS**.
> 2. Backend: Chuyển từ .NET sang **NodeJS**.
> 3. Infrastructure: Triển khai 100% bằng **Terraform** (IaC).
> 
> **DR Objectives:**
> - RTO (Recovery Time Objective): < 1 giờ.
> - RPO (Recovery Point Objective): < 15 phút.
>
> **Task:**
> Hãy viết cho tôi một tài liệu Solution Architecture chi tiết để nộp bài Assignment, trả lời đầy đủ các câu hỏi sau dựa trên quyết định chiến lược của tôi ở trên:
> 
> 1. **Component Mapping (Q2):** Map các thành phần cũ sang dịch vụ AWS tương ứng (Gợi ý: SQL Server -> Amazon RDS; RabbitMQ -> Amazon MQ; VM -> Amazon EC2 / ECS Fargate cho Node/React; Web Hosting -> S3 + CloudFront).
> 2. **Network Design (Q3):** Thiết kế VPC, Subnets (Public, Private, Data), NAT Gateway, ALB, và Security Groups như thế nào để đảm bảo tính cô lập và bảo mật?
> 3. **Authentication (Q4):** Dùng **Amazon Cognito User Pools** để xác thực end-user và phát JWT token cho app React/Node. Mô tả luồng: User đăng nhập qua Cognito Hosted UI → nhận JWT (Access Token + ID Token) → NodeJS API verify token bằng JWKS endpoint của Cognito.
> 4. **Disaster Recovery (Q5):** Với mục tiêu RTO < 1 giờ và RPO < 15 phút, hãy đề xuất chiến lược DR phù hợp (Pilot Light, Warm Standby, hay Active-Passive) giữa 2 AWS Regions. Sử dụng RDS Cross-Region Read Replica và Route 53 Failover Routing Policy. Giải thích tại sao chiến lược được chọn phù hợp với RTO/RPO đã đề ra.
> 5. **Cost Optimization (Q6):** Nêu các chiến lược tối ưu chi phí: ECS Fargate Spot, Graviton instances cho RDS, Auto Scaling, S3 Intelligent-Tiering, và Reserved Instances cho workload ổn định.
> 6. **Monitoring & Operations (Q7):** Liệt kê các dịch vụ AWS dùng để log và monitor: CloudWatch Logs & Metrics, CloudWatch Alarms, CloudTrail (audit trail), AWS X-Ray (distributed tracing). Mỗi service nêu rõ use case cụ thể.
> 7. **Migration Strategy (Q8):** Đề xuất lộ trình migration chi tiết theo 3 giai đoạn: Assess → Mobilize → Migrate & Modernize. Nhấn mạnh lợi ích của việc chuyển sang Node/React và dùng Terraform cho IaC.

---

### 🌟 BƯỚC 2: Vẽ Architecture Diagram (Q1)

*Sau khi AI trả lời xong Bước 1, bạn tiếp tục gửi prompt này để vẽ sơ đồ kiến trúc:*

> Dựa vào kiến trúc bạn vừa thiết kế ở trên, hãy giúp tôi giải quyết câu hỏi **"Q1: Architecture Diagram"**.
> 
> Hãy viết cho tôi mã **Mermaid.js** (`graph TD` – Top Down) để tôi có thể copy/paste vào [Mermaid Live Editor](https://mermaid.live). **Ưu tiên tính chính xác hơn thẩm mỹ.** Quy tắc:
> - Label mỗi node bằng tên AWS service (ví dụ: `ALB["ALB\n(Application Load Balancer)"]`).
> - Không dùng icon hay emoji trong node label để tránh parse error.
> - Nhóm các thành phần bằng `subgraph` theo tầng: Internet, VPC/Public Subnet, VPC/Private Subnet, VPC/Data Subnet.
>
> Sơ đồ cần thể hiện rõ các luồng sau:
> - Users → Route 53 → CloudFront (host ReactJS từ S3) / ALB.
> - ALB → ECS Fargate (NodeJS API) trong Private Subnet.
> - ECS Fargate → Amazon MQ (RabbitMQ) và Amazon RDS Multi-AZ trong Data Subnet.
> - Amazon Cognito (ngoài VPC) → ECS Fargate (verify JWT).
> - CloudWatch & X-Ray giám sát toàn bộ luồng.
> - Mũi tên có label mô tả chiều data flow (HTTPS, AMQP, SQL, etc.).

---

### 🌟 BƯỚC 3: Yêu cầu Code Terraform & Ứng dụng mẫu (Thực hành)

*Đây là phần tạo ra sự khác biệt cho bài assignment của bạn. Bạn sẽ có code thật để chứng minh kiến trúc của mình.*

> Tuyệt vời. Bây giờ tôi cần các đoạn code cơ bản để chứng minh tính khả thi của giải pháp (Proof of Concept).
> 
> **Nhiệm vụ 1: Terraform Code**
> Hãy viết cho tôi các file Terraform cơ bản gồm: `provider.tf`, `main.tf`, `variables.tf` để tạo bộ khung Network và Compute:
> - `provider.tf`: Khai báo AWS provider (region = `ap-southeast-1`) và backend `local` để lưu terraform state.
> - `main.tf`: Tạo các resource sau:
>   - 1 VPC với 1 Public Subnet và 1 Private Subnet (mỗi subnet nằm trong 1 AZ).
>   - 1 Internet Gateway gắn vào VPC.
>   - 1 NAT Gateway trong Public Subnet (cần Elastic IP).
>   - Route Tables phù hợp cho Public và Private Subnet.
>   - 1 ECS Cluster (Fargate launch type).
>   - 1 RDS instance (engine = `postgres`, instance class = `db.t3.micro`) nằm trong Private Subnet.
> - `variables.tf`: Khai báo các biến: `aws_region`, `vpc_cidr`, `project_name`.
>
> *Lưu ý: Code cần đủ để chạy `terraform init` và `terraform plan` thành công. Giả định máy đã cài AWS CLI và configure credentials với quyền tương ứng (EC2, ECS, RDS). Thêm comment giải thích mục đích của từng resource block.*
> 
> **Nhiệm vụ 2: Dummy App Code (NodeJS & ReactJS)**
> Hãy viết cho tôi 2 file code rất ngắn gọn, đủ để chạy test ở local:
> 1. `server.js` (NodeJS/Express): Có 1 endpoint `/api/status` trả về JSON `{ status: "Migrated to AWS successfully!", db: "connected", queue: "connected" }`. Thêm CORS header để ReactJS có thể fetch được.
> 2. `App.js` (ReactJS): Fetch data từ endpoint `/api/status` ở trên và hiển thị ra màn hình web. Xử lý cả trạng thái loading và error.

---