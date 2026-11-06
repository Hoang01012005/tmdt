from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


OUTPUT = r"D:\Downloads\New folder (5)\webTMDT\BAO_CAO_QUA_TRINH_VECTOR_DATABASE.docx"


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


def add_bullets(document, items):
    for item in items:
        paragraph = document.add_paragraph(style="List Bullet")
        paragraph.paragraph_format.space_after = Pt(3)
        run = paragraph.add_run(item)
        run.font.name = "Arial"
        run.font.size = Pt(10.5)


def add_code(document, text):
    paragraph = document.add_paragraph()
    paragraph.paragraph_format.left_indent = Inches(0.25)
    paragraph.paragraph_format.space_after = Pt(8)
    run = paragraph.add_run(text)
    run.font.name = "Consolas"
    run.font.size = Pt(9)
    run.font.color.rgb = RGBColor(30, 41, 59)
    return paragraph


def add_heading(document, text, level=1):
    paragraph = document.add_heading(text, level=level)
    paragraph.paragraph_format.space_before = Pt(12 if level == 1 else 8)
    paragraph.paragraph_format.space_after = Pt(6)
    return paragraph


document = Document()
section = document.sections[0]
section.top_margin = Inches(0.75)
section.bottom_margin = Inches(0.75)
section.left_margin = Inches(0.9)
section.right_margin = Inches(0.9)

styles = document.styles
styles["Normal"].font.name = "Arial"
styles["Normal"].font.size = Pt(10.5)
styles["Normal"].font.color.rgb = RGBColor(30, 41, 59)

header = section.header.paragraphs[0]
header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
header_run = header.add_run("TechStore | Báo cáo kỹ thuật")
header_run.font.name = "Arial"
header_run.font.size = Pt(8)
header_run.font.color.rgb = RGBColor(100, 116, 139)

footer = section.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
footer_run = footer.add_run("TechStore - 2026")
footer_run.font.name = "Arial"
footer_run.font.size = Pt(8)
footer_run.font.color.rgb = RGBColor(100, 116, 139)

title = document.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
title.paragraph_format.space_before = Pt(40)
run = title.add_run("BÁO CÁO QUÁ TRÌNH TÍCH HỢP\nVECTOR DATABASE")
run.bold = True
run.font.name = "Arial"
run.font.size = Pt(24)
run.font.color.rgb = RGBColor(30, 58, 138)

subtitle = document.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
subtitle.paragraph_format.space_before = Pt(12)
sub_run = subtitle.add_run("Hệ thống TechStore - webTMDT")
sub_run.font.name = "Arial"
sub_run.font.size = Pt(14)
sub_run.font.color.rgb = RGBColor(71, 85, 105)

meta = document.add_table(rows=5, cols=2)
meta.alignment = WD_TABLE_ALIGNMENT.CENTER
meta.style = "Table Grid"
meta_rows = [
    ("Dự án", "TechStore (webTMDT)"),
    ("Vector Database", "Cloudflare Vectorize"),
    ("Embedding model", "@cf/baai/bge-m3"),
    ("Vector index", "agentic-rag-index, 1024 dimensions, cosine"),
    ("Dữ liệu production", "33 sản phẩm D1; 16 vectors đã ghi nhận khi kiểm tra"),
]
for row, values in zip(meta.rows, meta_rows):
    set_cell_text(row.cells[0], values[0], bold=True)
    set_cell_text(row.cells[1], values[1])
    shade(row.cells[0], "EEF2FF")
    shade(row.cells[1], "F8FAFC")

document.add_page_break()

add_heading(document, "1. Mục tiêu", 1)
document.add_paragraph(
    "Tích hợp Vector Database vào TechStore để hỗ trợ tìm kiếm theo ngữ nghĩa, "
    "tư vấn sản phẩm bằng chatbot AI và truy vấn các tài liệu chính sách. "
    "Hệ thống kết hợp Vectorize với D1/FTS5 theo mô hình Hybrid RAG nhằm cân bằng "
    "giữa khả năng hiểu ngữ nghĩa và độ chính xác của dữ liệu tồn kho."
)
add_bullets(document, [
    "Tìm kiếm sản phẩm theo nhu cầu tự nhiên của người dùng.",
    "Tư vấn laptop, linh kiện PC và phụ kiện theo ngữ cảnh.",
    "Truy vấn chính sách bảo hành, vận chuyển và thanh toán.",
    "Đảm bảo câu hỏi tồn kho lấy số liệu trực tiếp từ D1.",
])

add_heading(document, "2. Kiến trúc công nghệ", 1)
table = document.add_table(rows=1, cols=3)
table.style = "Table Grid"
table.alignment = WD_TABLE_ALIGNMENT.CENTER
for cell, text in zip(table.rows[0].cells, ["Thành phần", "Vai trò", "Trạng thái"]):
    set_cell_text(cell, text, bold=True, color="FFFFFF")
    shade(cell, "4F46E5")
rows = [
    ("Cloudflare D1", "Lưu sản phẩm, giá, thông số và tồn kho; truy vấn SQL/FTS5.", "Đang sử dụng"),
    ("Cloudflare Vectorize", "Lưu và tìm kiếm vector embedding theo cosine similarity.", "Đã cấu hình"),
    ("Workers AI", "Tạo embedding bằng model @cf/baai/bge-m3.", "Đang sử dụng"),
    ("Cloudflare KV", "Cache và lưu lịch sử hội thoại chatbot.", "Đang sử dụng"),
    ("Hono Worker", "Điều phối RAG và cung cấp các API backend.", "Đang triển khai"),
]
for values in rows:
    cells = table.add_row().cells
    for index, value in enumerate(values):
        set_cell_text(cells[index], value)
        shade(cells[index], "F8FAFC" if index % 2 else "FFFFFF")

add_heading(document, "3. Quy trình tạo và lưu vector", 1)
steps = [
    "Đọc danh sách sản phẩm từ bảng products trong Cloudflare D1.",
    "Chuẩn hóa thông tin thành văn bản gồm thương hiệu, tên, danh mục, giá, thông số, tình trạng và mô tả.",
    "Gửi văn bản đến Workers AI với model @cf/baai/bge-m3.",
    "Nhận vector embedding 1024 chiều.",
    "Lưu vector cùng metadata vào index agentic-rag-index.",
    "Thực hiện tương tự với tài liệu chính sách bảo hành và vận chuyển.",
]
for index, step in enumerate(steps, 1):
    paragraph = document.add_paragraph()
    paragraph.paragraph_format.left_indent = Inches(0.15)
    paragraph.paragraph_format.space_after = Pt(4)
    run = paragraph.add_run(f"{index}. {step}")
    run.font.name = "Arial"
    run.font.size = Pt(10.5)

add_heading(document, "4. Quy trình chatbot truy vấn", 1)
add_bullets(document, [
    "Phân tích intent của câu hỏi người dùng.",
    "Câu hỏi ngữ nghĩa hoặc chính sách được embedding và truy vấn Vectorize.",
    "Câu hỏi theo tên, danh mục, giá hoặc tồn kho được truy vấn bằng D1/FTS5.",
    "Kết quả từ các nguồn được hợp nhất thành context cho mô hình AI.",
    "AI tạo câu trả lời và chỉ trả về ID sản phẩm hợp lệ trong context.",
    "Các câu hỏi ngoài phạm vi công nghệ được chặn để tránh sinh thông tin sai.",
])

add_heading(document, "5. Mô hình Hybrid RAG", 1)
table = document.add_table(rows=1, cols=2)
table.style = "Table Grid"
table.alignment = WD_TABLE_ALIGNMENT.CENTER
for cell, text in zip(table.rows[0].cells, ["Loại câu hỏi", "Nguồn xử lý"]):
    set_cell_text(cell, text, bold=True, color="FFFFFF")
    shade(cell, "4F46E5")
hybrid_rows = [
    ("Tên sản phẩm, thương hiệu, mã sản phẩm", "D1 + FTS5"),
    ("Lọc danh mục, giá, tình trạng", "D1 + SQL"),
    ("Tư vấn theo nhu cầu tự nhiên", "Vectorize + D1"),
    ("Chính sách bảo hành/vận chuyển", "Vectorize"),
    ("Số lượng sản phẩm trong kho", "D1 trực tiếp"),
    ("Câu hỏi ngoài phạm vi", "Intent guard, không truy vấn sản phẩm"),
]
for values in hybrid_rows:
    cells = table.add_row().cells
    for index, value in enumerate(values):
        set_cell_text(cells[index], value)
        shade(cells[index], "F8FAFC")

add_heading(document, "6. Các API liên quan", 1)
add_bullets(document, [
    "POST /api/vectorize/sync: đồng bộ sản phẩm và chính sách từ D1 sang Vectorize.",
    "POST /api/vectorize/ingest: nạp tài liệu văn bản và tạo embedding.",
    "POST /api/consultation/chat: tiếp nhận câu hỏi và trả lời chatbot.",
    "GET /api/products: lấy danh sách sản phẩm từ D1.",
])
add_code(document, "POST /api/vectorize/sync")
add_code(document, "POST /api/consultation/chat")

add_heading(document, "7. Kết quả triển khai", 1)
add_bullets(document, [
    "Cloudflare Vectorize index agentic-rag-index đã được tạo thành công.",
    "Index sử dụng 1024 dimensions và cosine similarity.",
    "Kiểm tra production ghi nhận 16 vectors trong index tại thời điểm báo cáo.",
    "Cloudflare D1 production hiện có 33 sản phẩm: 10 laptop, 12 linh kiện và 11 phụ kiện.",
    "Chatbot đã sử dụng D1 trực tiếp cho câu hỏi tồn kho để trả số liệu chính xác.",
    "Các câu hỏi ngoài phạm vi như thời tiết hoặc nhân vật chính trị được chặn khỏi luồng tư vấn sản phẩm.",
])

add_heading(document, "8. Hạn chế và hướng phát triển", 1)
add_bullets(document, [
    "Số vector hiện tại chưa đồng bộ đủ với toàn bộ 33 sản phẩm trong D1.",
    "Cần chạy POST /api/vectorize/sync sau mỗi lần bổ sung sản phẩm hoặc thay đổi chính sách.",
    "Có thể bổ sung cơ chế tự động đồng bộ Vectorize sau migration D1.",
    "Có thể theo dõi score, latency và tỷ lệ truy vấn Vectorize để đánh giá chất lượng RAG.",
])

add_heading(document, "9. Kết luận", 1)
document.add_paragraph(
    "TechStore đã triển khai nền tảng Vector Database bằng Cloudflare Vectorize "
    "và tích hợp vào kiến trúc Agentic RAG. D1 giữ vai trò nguồn dữ liệu chính xác "
    "cho sản phẩm và tồn kho, trong khi Vectorize hỗ trợ hiểu ngữ nghĩa và truy vấn "
    "tài liệu. Mô hình kết hợp này giúp chatbot tư vấn linh hoạt hơn nhưng vẫn "
    "kiểm soát được tính chính xác của thông tin thương mại."
)

document.save(OUTPUT)
print(OUTPUT)
