---
name: ontology-generator
description: Skill chuyên dụng để tạo Ontology JSON file từ các file markdown source docs. Sử dụng để xây dựng Knowledge Ontology Explorer.
---

# Ontology Generator Skill

Skill này hướng dẫn agent cách parse một thư mục chứa các file markdown documentations và trích xuất cấu trúc kiến thức (ontology) dưới dạng file JSON.

## Workflow

Khi user yêu cầu tạo ontology từ một source directory, hãy làm theo các bước sau:

1. **Hiểu Domain:**
   - Xác định `domain` mà user muốn tạo (ví dụ: `azure-ai-agent`).
   - Xác định `depth` mong muốn (thường là 4-5 levels).
   
2. **Scan Source Docs:**
   - Sử dụng `run_command` với `find` hoặc `grep` để xem danh sách các file `.md` trong thư mục source.
   - Đọc qua các file chính (`overview.md`, `index.md`, các folder cấu trúc).

3. **Chạy CLI Script:**
   - Đề xuất user chạy lệnh CLI đã được build sẵn để tự động crawl và tạo file:
     ```bash
     pnpm aha-mind:ontology generate --source <path-to-source-dir> --domain <domain-name> --depth <depth> --output static/ontology/<domain-name>.json
     ```
   - Nếu script chưa hỗ trợ 100% tự động, bạn (agent) cần đọc kết quả scan, thiết kế file JSON structure bằng tay theo định dạng schema, sau đó dùng công cụ `write_to_file` để lưu.

4. **Review & Map:**
   - Kiểm tra xem JSON được tạo ra có match với thư mục `docs/` hiện tại của Docusaurus không.
   - Bổ sung `docLink` thủ công vào các node nếu script chưa link hết.
   
5. **Cấu trúc JSON Schema:**
   - Luôn tham chiếu `static/ontology/<domain-name>.schema.json` để đảm bảo output đúng cấu trúc.
