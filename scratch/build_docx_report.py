import os
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

MD_PATH = r"C:\Users\User\.gemini\antigravity\brain\4be440e7-b618-4581-8628-0193858906f2\BAO_CAO_RAG_CHATBOT.md"
DOCX_PATH = r"d:\Downloads\New folder (5)\webTMDT\BAO_CAO_RAG_CHATBOT.docx"

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=180, right=180):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="D1D5DB", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:left w:val="none"/>'
        f'  <w:right w:val="none"/>'
        f'  <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def format_inlines(paragraph, text, base_font_name="Calibri", base_size_pt=11, base_color=RGBColor(30, 41, 59)):
    # Regular expression to match bold, italic, inline code
    # e.g. **bold**, *italic*, `code`
    tokens = re.split(r'(\*\*.*?\*\*|\*.*?\*|`.*?`)', text)
    for token in tokens:
        if not token:
            continue
        if token.startswith('**') and token.endswith('**') and len(token) >= 4:
            run = paragraph.add_run(token[2:-2])
            run.bold = True
            run.font.name = base_font_name
            run.font.size = Pt(base_size_pt)
            run.font.color.rgb = base_color
        elif token.startswith('*') and token.endswith('*') and len(token) >= 2 and not token.startswith('**'):
            run = paragraph.add_run(token[1:-1])
            run.italic = True
            run.font.name = base_font_name
            run.font.size = Pt(base_size_pt)
            run.font.color.rgb = base_color
        elif token.startswith('`') and token.endswith('`') and len(token) >= 2:
            run = paragraph.add_run(token[1:-1])
            run.font.name = "Consolas"
            run.font.size = Pt(base_size_pt - 0.5)
            run.font.color.rgb = RGBColor(180, 40, 70)
        else:
            run = paragraph.add_run(token)
            run.font.name = base_font_name
            run.font.size = Pt(base_size_pt)
            run.font.color.rgb = base_color

def create_document():
    doc = Document()

    # 1. Page Setup - Margins (Top 2cm, Bottom 2cm, Left 2.5cm, Right 2cm)
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(0.8)
        section.header.is_linked_to_previous = False
        
        # Header setup
        hp = section.header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("TechStore — Báo Cáo Kỹ Thuật Hệ Thống Chatbot Agentic RAG")
        hrun.font.name = "Calibri"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(148, 163, 184)

        # Footer setup
        fp = section.footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Trang ")
        frun.font.name = "Calibri"
        frun.font.size = Pt(9)
        frun.font.color.rgb = RGBColor(100, 116, 139)
        # Add page number XML
        fldSimple = parse_xml(r'<w:fldSimple %s w:instr="PAGE"/>' % nsdecls('w'))
        fp._p.append(fldSimple)
        frun2 = fp.add_run(" / ")
        frun2.font.name = "Calibri"
        frun2.font.size = Pt(9)
        frun2.font.color.rgb = RGBColor(100, 116, 139)
        fldSimple2 = parse_xml(r'<w:fldSimple %s w:instr="NUMPAGES"/>' % nsdecls('w'))
        fp._p.append(fldSimple2)

    # 2. Cover Page
    cover_p1 = doc.add_paragraph()
    cover_p1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cover_p1.paragraph_format.space_before = Pt(40)
    cover_p1.paragraph_format.space_after = Pt(4)
    r_sub = cover_p1.add_run("NỀN TẢNG THƯƠNG MẠI ĐIỆN TỬ THIẾT BỊ CÔNG NGHỆ TECHSTORE")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(13)
    r_sub.bold = True
    r_sub.font.color.rgb = RGBColor(71, 85, 105)

    cover_p2 = doc.add_paragraph()
    cover_p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cover_p2.paragraph_format.space_before = Pt(10)
    cover_p2.paragraph_format.space_after = Pt(14)
    r_title = cover_p2.add_run("BÁO CÁO KỸ THUẬT CHUYÊN SÂU\nHỆ THỐNG CHATBOT TƯ VẤN SẢN PHẨM CÔNG NGHỆ\nKIẾN TRÚC AGENTIC RAG & TRỢ LÝ ẢO 3D")
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(22)
    r_title.bold = True
    r_title.font.color.rgb = RGBColor(30, 58, 138)  # Deep Navy Blue

    # Decorative Line
    p_line = doc.add_paragraph()
    p_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_line.paragraph_format.space_after = Pt(24)
    r_line = p_line.add_run("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    r_line.font.color.rgb = RGBColor(59, 130, 246)

    # Metadata Box (Table)
    tbl_meta = doc.add_table(rows=6, cols=2)
    tbl_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_info = [
        ("Tên dự án:", "TechStore (webTMDT) - E-Commerce Platform"),
        ("Kiến trúc AI:", "Agentic RAG (5-Node Self-Correcting Architecture)"),
        ("Mô hình AI:", "Google Gemini Flash 1.5 (OpenRouter) & Meta LLaMA 3.1 8B (Workers AI)"),
        ("Cơ sở dữ liệu:", "Cloudflare D1 (SQLite FTS5), Cloudflare Vectorize, Cloudflare KV"),
        ("Giao diện & 3D:", "React 19, TypeScript, Three.js VRM Companion, Web Speech API"),
        ("Hạ tầng triển khai:", "Cloudflare Edge Network (Single Worker Architecture)"),
    ]
    for row_idx, (label, val) in enumerate(meta_info):
        row = tbl_meta.rows[row_idx]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width = Inches(2.2)
        c1.width = Inches(4.3)
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_after = Pt(4)
        p0.paragraph_format.space_before = Pt(4)
        r0 = p0.add_run(label)
        r0.font.name = "Calibri"
        r0.font.size = Pt(10.5)
        r0.bold = True
        r0.font.color.rgb = RGBColor(30, 41, 59)

        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_after = Pt(4)
        p1.paragraph_format.space_before = Pt(4)
        r1 = p1.add_run(val)
        r1.font.name = "Calibri"
        r1.font.size = Pt(10.5)
        r1.font.color.rgb = RGBColor(51, 65, 85)

        set_cell_background(c0, "F8FAFC")
        set_cell_background(c1, "F8FAFC")
        set_cell_margins(c0, top=80, bottom=80, left=120, right=120)
        set_cell_margins(c1, top=80, bottom=80, left=120, right=120)

    set_table_borders(tbl_meta, color="E2E8F0", sz="4")

    # Bottom notes on cover page
    p_bot = doc.add_paragraph()
    p_bot.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_bot.paragraph_format.space_before = Pt(80)
    r_bot = p_bot.add_run("Báo cáo Nghiên cứu & Triển khai Thực tế\nNăm 2026")
    r_bot.font.name = "Calibri"
    r_bot.font.size = Pt(11)
    r_bot.font.color.rgb = RGBColor(100, 116, 139)

    doc.add_page_break()

    # 3. Read Markdown
    with open(MD_PATH, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    in_code_block = False
    code_lines = []
    code_lang = ""

    in_table = False
    table_lines = []

    skip_header_lines = True

    i = 0
    total_lines = len(lines)
    while i < total_lines:
        line = lines[i].rstrip('\r\n')

        # Check for code blocks
        if line.startswith('```'):
            if not in_code_block:
                in_code_block = True
                code_lang = line[3:].strip()
                code_lines = []
                i += 1
                continue
            else:
                # End of code block
                in_code_block = False
                # Render code block as single cell table with light gray background
                code_text = "\n".join(code_lines)
                tbl_code = doc.add_table(rows=1, cols=1)
                tbl_code.alignment = WD_TABLE_ALIGNMENT.CENTER
                cell = tbl_code.rows[0].cells[0]
                cell.width = Inches(6.5)
                set_cell_background(cell, "F8FAFC")
                set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
                set_table_borders(tbl_code, color="CBD5E1", sz="6", val="single")

                p_c = cell.paragraphs[0]
                p_c.paragraph_format.space_after = Pt(2)
                p_c.paragraph_format.space_before = Pt(2)
                p_c.paragraph_format.line_spacing = 1.05
                run_c = p_c.add_run(code_text)
                run_c.font.name = "Consolas"
                run_c.font.size = Pt(8.5)
                run_c.font.color.rgb = RGBColor(15, 23, 42)

                # Space after table
                p_sp = doc.add_paragraph()
                p_sp.paragraph_format.space_after = Pt(4)
                p_sp.paragraph_format.space_before = Pt(0)
                i += 1
                continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # Check for table rows (| ... |)
        if line.startswith('|') and line.endswith('|'):
            table_lines.append(line)
            i += 1
            continue
        elif table_lines:
            # End of table, render table
            raw_rows = [t for t in table_lines if not re.match(r'^\|[\s\-:|]+\|$', t.strip())]
            if raw_rows:
                parsed_rows = []
                for rr in raw_rows:
                    cols = [c.strip() for c in rr.strip('|').split('|')]
                    parsed_rows.append(cols)
                
                max_cols = max(len(r) for r in parsed_rows)
                # Normalize row length
                for r in parsed_rows:
                    while len(r) < max_cols:
                        r.append("")

                tbl = doc.add_table(rows=len(parsed_rows), cols=max_cols)
                tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
                set_table_borders(tbl, color="CBD5E1", sz="4")

                for r_idx, r_data in enumerate(parsed_rows):
                    row_obj = tbl.rows[r_idx]
                    is_header = (r_idx == 0)
                    bg_color = "1E3A8A" if is_header else ("F8FAFC" if r_idx % 2 == 1 else "FFFFFF")
                    text_color = RGBColor(255, 255, 255) if is_header else RGBColor(30, 41, 59)

                    for c_idx, cell_value in enumerate(r_data):
                        c_obj = row_obj.cells[c_idx]
                        set_cell_background(c_obj, bg_color)
                        set_cell_margins(c_obj, top=100, bottom=100, left=140, right=140)
                        cp = c_obj.paragraphs[0]
                        cp.paragraph_format.space_before = Pt(3)
                        cp.paragraph_format.space_after = Pt(3)
                        cp.paragraph_format.line_spacing = 1.15
                        
                        format_inlines(cp, cell_value, base_font_name="Calibri", base_size_pt=9.5 if is_header else 9.5, base_color=text_color)
                        if is_header:
                            for r_item in cp.runs:
                                r_item.bold = True

                p_after_t = doc.add_paragraph()
                p_after_t.paragraph_format.space_before = Pt(2)
                p_after_t.paragraph_format.space_after = Pt(6)

            table_lines = []

        # Ignore markdown title and header on the first lines since we already made a cover page
        if i < 20 and (line.startswith('# BÁO CÁO') or line.startswith('# HỆ THỐNG') or line.startswith('# DỰA TRÊN') or line.startswith('---')):
            i += 1
            continue

        if not line.strip():
            i += 1
            continue

        # Check blockquote (> ...)
        if line.startswith('>'):
            quote_text = line.lstrip('> ').strip()
            # Accumulate multi-line blockquotes if needed
            tbl_q = doc.add_table(rows=1, cols=1)
            tbl_q.alignment = WD_TABLE_ALIGNMENT.CENTER
            cell = tbl_q.rows[0].cells[0]
            cell.width = Inches(6.5)
            set_cell_background(cell, "EFF6FF")
            set_cell_margins(cell, top=100, bottom=100, left=180, right=140)
            # Add blue left border
            tcPr = cell._tc.get_or_add_tcPr()
            tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:left w:val="single" w:sz="24" w:space="0" w:color="2563EB"/><w:top w:val="none"/><w:right w:val="none"/><w:bottom w:val="none"/></w:tcBorders>')
            tcPr.append(tcBorders)

            qp = cell.paragraphs[0]
            qp.paragraph_format.space_before = Pt(4)
            qp.paragraph_format.space_after = Pt(4)
            qp.paragraph_format.line_spacing = 1.2
            format_inlines(qp, quote_text, base_font_name="Calibri", base_size_pt=10.5, base_color=RGBColor(30, 58, 138))
            for run_q in qp.runs:
                run_q.italic = True

            doc.add_paragraph().paragraph_format.space_after = Pt(2)
            i += 1
            continue

        # Headings
        if line.startswith('## '):
            h_text = line[3:].strip()
            # Add page break before major numbered sections (1., 2., 3., etc.)
            if re.match(r'^\d+\.', h_text) and not h_text.startswith('1. '):
                doc.add_page_break()

            hp = doc.add_paragraph()
            hp.paragraph_format.space_before = Pt(18)
            hp.paragraph_format.space_after = Pt(8)
            hp.paragraph_format.keep_with_next = True
            hrun = hp.add_run(h_text)
            hrun.font.name = "Calibri"
            hrun.font.size = Pt(16)
            hrun.bold = True
            hrun.font.color.rgb = RGBColor(30, 58, 138)  # Navy
            i += 1
            continue

        if line.startswith('### '):
            h_text = line[4:].strip()
            hp = doc.add_paragraph()
            hp.paragraph_format.space_before = Pt(14)
            hp.paragraph_format.space_after = Pt(6)
            hp.paragraph_format.keep_with_next = True
            hrun = hp.add_run(h_text)
            hrun.font.name = "Calibri"
            hrun.font.size = Pt(13)
            hrun.bold = True
            hrun.font.color.rgb = RGBColor(37, 99, 235)  # Royal Blue
            i += 1
            continue

        if line.startswith('#### '):
            h_text = line[5:].strip()
            hp = doc.add_paragraph()
            hp.paragraph_format.space_before = Pt(10)
            hp.paragraph_format.space_after = Pt(4)
            hp.paragraph_format.keep_with_next = True
            hrun = hp.add_run(h_text)
            hrun.font.name = "Calibri"
            hrun.font.size = Pt(11.5)
            hrun.bold = True
            hrun.font.color.rgb = RGBColor(51, 65, 85)
            i += 1
            continue

        # Bullet lists (- ... or * ...)
        if line.startswith('- ') or line.startswith('* '):
            bullet_text = line[2:].strip()
            bp = doc.add_paragraph(style='List Bullet')
            bp.paragraph_format.space_before = Pt(2)
            bp.paragraph_format.space_after = Pt(3)
            bp.paragraph_format.line_spacing = 1.2
            format_inlines(bp, bullet_text, base_font_name="Calibri", base_size_pt=11, base_color=RGBColor(51, 65, 85))
            i += 1
            continue

        # Numbered lists (1. ... or 2. ...)
        num_match = re.match(r'^(\d+)\.\s+(.*)$', line)
        if num_match:
            num_idx = num_match.group(1)
            num_text = num_match.group(2)
            np = doc.add_paragraph(style='List Number')
            np.paragraph_format.space_before = Pt(2)
            np.paragraph_format.space_after = Pt(3)
            np.paragraph_format.line_spacing = 1.2
            format_inlines(np, num_text, base_font_name="Calibri", base_size_pt=11, base_color=RGBColor(51, 65, 85))
            i += 1
            continue

        # Standard Paragraph
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(3)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.25
        format_inlines(p, line, base_font_name="Calibri", base_size_pt=11, base_color=RGBColor(30, 41, 59))

        i += 1

    # Save docx
    doc.save(DOCX_PATH)
    print(f"Successfully generated DOCX at: {DOCX_PATH}")

if __name__ == "__main__":
    create_document()
