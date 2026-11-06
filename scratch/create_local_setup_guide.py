from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


OUTPUT = r"D:\Downloads\New folder (5)\webTMDT\HUONG_DAN_CLONE_VA_CHAY_LOCALHOST_ENV.docx"


def shade(cell, color):
    properties = cell._tc.get_or_add_tcPr()
    shading = OxmlElement("w:shd")
    shading.set(qn("w:fill"), color)
    properties.append(shading)


def set_cell_text(cell, text, bold=False, color="1E293B"):
    cell.text = ""
    paragraph = cell.paragraphs[0]
    paragraph.paragraph_format.space_after = Pt(3)
    run = paragraph.add_run(text)
    run.bold = bold
    run.font.name = "Arial"
    run.font.size = Pt(10)
    run.font.color.rgb = RGBColor.from_string(color)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER


def heading(document, text, level=1):
    paragraph = document.add_heading(text, level=level)
    paragraph.paragraph_format.space_before = Pt(12 if level == 1 else 8)
    paragraph.paragraph_format.space_after = Pt(5)
    return paragraph


def code(document, text):
    paragraph = document.add_paragraph()
    paragraph.paragraph_format.left_indent = Inches(0.25)
    paragraph.paragraph_format.space_after = Pt(7)
    run = paragraph.add_run(text)
    run.font.name = "Consolas"
    run.font.size = Pt(9)
    run.font.color.rgb = RGBColor(30, 41, 59)
    return paragraph


def bullets(document, values):
    for value in values:
        paragraph = document.add_paragraph(style="List Bullet")
        paragraph.paragraph_format.space_after = Pt(3)
        run = paragraph.add_run(value)
        run.font.name = "Arial"
        run.font.size = Pt(10.5)


document = Document()
section = document.sections[0]
section.top_margin = Inches(0.75)
section.bottom_margin = Inches(0.75)
section.left_margin = Inches(0.9)
section.right_margin = Inches(0.9)

document.styles["Normal"].font.name = "Arial"
document.styles["Normal"].font.size = Pt(10.5)
document.styles["Normal"].font.color.rgb = RGBColor(30, 41, 59)

header = section.header.paragraphs[0]
header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
run = header.add_run("TechStore | Hướng dẫn cài đặt local")
run.font.name = "Arial"
run.font.size = Pt(8)
run.font.color.rgb = RGBColor(100, 116, 139)

footer = section.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = footer.add_run("TechStore - webTMDT")
run.font.name = "Arial"
run.font.size = Pt(8)
run.font.color.rgb = RGBColor(100, 116, 139)

title = document.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
title.paragraph_format.space_before = Pt(40)
run = title.add_run("HƯỚNG DẪN CLONE VÀ CHẠY DỰ ÁN\nTRÊN LOCALHOST")
run.bold = True
run.font.name = "Arial"
run.font.size = Pt(23)
run.font.color.rgb = RGBColor(30, 58, 138)

subtitle = document.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = subtitle.add_run("Dự án TechStore - webTMDT")
run.font.name = "Arial"
run.font.size = Pt(14)
run.font.color.rgb = RGBColor(71, 85, 105)

meta = document.add_table(rows=4, cols=2)
meta.alignment = WD_TABLE_ALIGNMENT.CENTER
meta.style = "Table Grid"
meta_values = [
    ("Repository", "https://github.com/Hoang01012005/tmdt.git"),
    ("Frontend", "React 19 + TypeScript + Vite + Tailwind CSS"),
    ("Backend", "Cloudflare Worker + Hono + Wrangler"),
    ("Database local", "Cloudflare D1 local emulator + seed data"),
]
for row, values in zip(meta.rows, meta_values):
    set_cell_text(row.cells[0], values[0], bold=True)
    set_cell_text(row.cells[1], values[1])
    shade(row.cells[0], "EEF2FF")
    shade(row.cells[1], "F8FAFC")

document.add_page_break()

heading(document, "1. Tổng quan", 1)
document.add_paragraph(
    "Tài liệu này dành cho người mới nhận mã nguồn TechStore từ GitHub. "
    "Sau khi hoàn thành các bước, người dùng có thể chạy frontend và backend "
    "trên máy cá nhân, sử dụng dữ liệu D1 local và truy cập cửa hàng tại localhost."
)
bullets(document, [
    "Frontend: http://localhost:5174",
    "Backend API: http://127.0.0.1:8788",
    "Dữ liệu sản phẩm: apps/api/schema.sql và apps/api/seed.sql",
])

heading(document, "2. Phần mềm cần cài trước", 1)
bullets(document, [
    "Git: https://git-scm.com/downloads",
    "Node.js phiên bản LTS, khuyến nghị Node.js 20 trở lên: https://nodejs.org/",
    "Một trình soạn thảo mã nguồn như Visual Studio Code.",
])
paragraph = document.add_paragraph()
paragraph.add_run("Kiểm tra cài đặt bằng PowerShell:").bold = True
code(document, "git --version\nnode --version\nnpm --version")

heading(document, "3. Clone mã nguồn từ GitHub", 1)
document.add_paragraph("Mở PowerShell, chọn thư mục muốn lưu dự án, sau đó chạy:")
code(document, "cd D:\\Projects\ngit clone https://github.com/Hoang01012005/tmdt.git webTMDT\ncd webTMDT")
document.add_paragraph(
    "Nếu repository là private, GitHub sẽ yêu cầu đăng nhập hoặc Personal Access Token. "
    "Không chia sẻ token trong mã nguồn hoặc file cấu hình."
)

heading(document, "4. Cài dependencies", 1)
code(document, "npm install")
document.add_paragraph(
    "Lệnh này cài dependencies cho workspace root, apps/api và apps/web. "
    "Không cần chạy npm install riêng trong từng thư mục nếu lệnh root hoàn tất thành công."
)

heading(document, "5. Khởi tạo database local", 1)
document.add_paragraph(
    "Dự án dùng Cloudflare D1 local thông qua Wrangler. Lệnh sau tạo bảng, index, "
    "trigger và nạp dữ liệu sản phẩm, user và order mẫu:"
)
code(document, "npm run db:init")
document.add_paragraph(
    "Lệnh trên tương đương việc chạy schema.sql và seed.sql ở chế độ local. "
    "Không dùng db:init:remote nếu chỉ muốn chạy trên localhost."
)
document.add_paragraph("Có thể kiểm tra số lượng sản phẩm local:")
code(document, "cd apps\\api\nnpx wrangler d1 execute store-db --local --command \"SELECT COUNT(*) AS total FROM products;\"\ncd ..\\..")

heading(document, "6. Cấu hình API key cho chatbot", 1)
document.add_paragraph(
    "API key không được dán vào apps/api/seed.sql. File seed.sql chỉ chứa dữ liệu database. "
    "Không commit API key vào GitHub và không gửi key trong ảnh chụp màn hình."
)
document.add_paragraph("Khi chạy local, mở file apps/api/.env và thay nội dung mẫu bằng API key của bạn:")
code(document, 'OPENROUTER_API_KEY="DAN_API_KEY_CUA_BAN_VAO_DAY"')
document.add_paragraph(
    "Lưu file, quay lại thư mục gốc và chạy lại npm run dev. Wrangler tự động đọc "
    "apps/api/.env khi khởi động Worker local. File .env là file bí mật, "
    "không đưa vào Git."
)
document.add_paragraph("File apps/api/.env đã được Git bỏ qua thông qua các quy tắc .env trong .gitignore.")
document.add_paragraph(
    "Khi deploy production, không ghi key vào wrangler.toml. Đăng nhập Cloudflare rồi chạy:"
)
code(document, "npx wrangler login\ncd apps\\api\nnpx wrangler secret put OPENROUTER_API_KEY\ncd ..\\..")
document.add_paragraph(
    "Wrangler sẽ hiện ô nhập bí mật trong terminal. Dán API key, nhấn Enter rồi deploy lại. "
    "Có thể kiểm tra tên secret (không hiển thị giá trị) bằng:"
)
code(document, "cd apps\\api\nnpx wrangler secret list\ncd ..\\..")
document.add_paragraph(
    "Nếu không cấu hình OPENROUTER_API_KEY, chatbot vẫn có thể dùng các nhánh dữ liệu "
    "D1/Vectorize và fallback local; các chức năng cần OpenRouter sẽ không gọi được mô hình ngoài."
)

heading(document, "7. Chạy dự án trên localhost", 1)
document.add_paragraph("Từ thư mục gốc webTMDT, chạy:")
code(document, "npm run dev")
document.add_paragraph(
    "Lệnh này khởi động đồng thời API Worker và frontend Vite. Mở trình duyệt tại:"
)
code(document, "http://localhost:5174")
document.add_paragraph(
    "Frontend tự chuyển tiếp các request /api sang backend tại 127.0.0.1:8788 "
    "theo cấu hình trong apps/web/vite.config.ts."
)

heading(document, "8. Chạy riêng từng phần nếu cần", 1)
document.add_paragraph("Terminal 1 - backend:")
code(document, "cd apps\\api\nnpm run dev")
document.add_paragraph("Terminal 2 - frontend:")
code(document, "cd apps\\web\nnpm run dev")

heading(document, "9. Kiểm tra dự án đã chạy đúng", 1)
bullets(document, [
    "Mở http://localhost:5174 và thấy trang TechStore.",
    "Các khu vực laptop, linh kiện và phụ kiện hiển thị sản phẩm.",
    "Mở chatbot và hỏi: “shop có bao nhiêu sản phẩm”.",
    "API trả về dữ liệu từ D1 local thay vì lỗi 404.",
    "Có thể thêm sản phẩm vào giỏ hàng và mở cửa sổ chi tiết sản phẩm.",
])
document.add_paragraph("Kiểm tra typecheck và build:")
code(document, "npm run typecheck\nnpm run build")

heading(document, "10. Cấu trúc thư mục quan trọng", 1)
table = document.add_table(rows=1, cols=2)
table.style = "Table Grid"
table.alignment = WD_TABLE_ALIGNMENT.CENTER
for cell, text in zip(table.rows[0].cells, ["Đường dẫn", "Chức năng"]):
    set_cell_text(cell, text, bold=True, color="FFFFFF")
    shade(cell, "4F46E5")
paths = [
    ("apps/web/src", "Mã nguồn giao diện React"),
    ("apps/web/src/data/products.ts", "Dữ liệu fallback sản phẩm frontend"),
    ("apps/api/src/index.ts", "API Worker và logic chatbot"),
    ("apps/api/schema.sql", "Schema database D1"),
    ("apps/api/seed.sql", "Dữ liệu mẫu D1"),
    ("apps/api/wrangler.toml", "Cấu hình Worker, D1, KV và Vectorize"),
    ("apps/web/vite.config.ts", "Cấu hình Vite và proxy API local"),
]
for path, purpose in paths:
    cells = table.add_row().cells
    set_cell_text(cells[0], path)
    set_cell_text(cells[1], purpose)
    shade(cells[0], "F8FAFC")
    shade(cells[1], "FFFFFF")

heading(document, "11. Lỗi thường gặp và cách xử lý", 1)
heading(document, "11.1. Port 5174 hoặc 8788 đang được sử dụng", 2)
document.add_paragraph(
    "Đóng terminal đang chạy dự án cũ hoặc tìm và dừng tiến trình chiếm port. "
    "Sau đó chạy lại npm run dev."
)
heading(document, "11.2. Dữ liệu sản phẩm không hiển thị", 2)
code(document, "npm run db:init")
document.add_paragraph(
    "Nếu vẫn lỗi, xóa dữ liệu D1 local bằng lệnh Wrangler phù hợp rồi chạy lại db:init. "
    "Lưu ý thao tác này chỉ ảnh hưởng dữ liệu local."
)
heading(document, "11.3. Lỗi thiếu module", 2)
code(document, "Remove-Item -Recurse -Force node_modules\nnpm install")
document.add_paragraph(
    "Chỉ dùng lệnh xóa node_modules khi npm install bị lỗi dependency. "
    "Không xóa thư mục .wrangler nếu chưa cần reset database local."
)
heading(document, "11.4. API không kết nối từ frontend", 2)
bullets(document, [
    "Đảm bảo backend Worker đang chạy ở cổng 8788.",
    "Đảm bảo frontend chạy ở cổng 5174.",
    "Kiểm tra terminal API có lỗi Wrangler hoặc D1 hay không.",
    "Kiểm tra frontend đang gọi URL bắt đầu bằng /api.",
])

heading(document, "12. Quy trình làm việc đề xuất", 1)
bullets(document, [
    "Kéo thay đổi mới nhất bằng git pull trước khi làm việc.",
    "Chạy npm install khi package.json hoặc package-lock.json thay đổi.",
    "Chạy npm run db:init khi schema hoặc seed thay đổi.",
    "Chạy npm run typecheck trước khi commit.",
    "Chạy npm run build để xác nhận frontend build thành công.",
])

heading(document, "13. Dừng dự án", 1)
document.add_paragraph(
    "Quay lại terminal đang chạy npm run dev và nhấn Ctrl + C. "
    "Nếu chạy riêng hai terminal, dừng cả backend và frontend."
)

heading(document, "14. Ghi chú triển khai production", 1)
document.add_paragraph(
    "Các lệnh local ở trên không deploy lên Cloudflare. Deploy production cần quyền "
    "Cloudflare và được thực hiện riêng bằng npx wrangler login, db:init:remote và npm run deploy. "
    "Không chạy db:init:remote nếu chỉ được giao nhiệm vụ chạy dự án trên máy cá nhân."
)

document.save(OUTPUT)
print(OUTPUT)
