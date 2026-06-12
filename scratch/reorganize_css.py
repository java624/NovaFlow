import re
import os

def parse_inner_blocks(content):
    blocks = []
    current_block = ""
    brace_depth = 0
    in_comment = False
    
    i = 0
    n = len(content)
    while i < n:
        char = content[i]
        
        if not in_comment and i + 1 < n and content[i] == '/' and content[i+1] == '*':
            in_comment = True
            current_block += '/*'
            i += 2
            continue
        if in_comment and i + 1 < n and content[i] == '*' and content[i+1] == '/':
            in_comment = False
            current_block += '*/'
            i += 2
            continue
            
        if in_comment:
            current_block += char
            i += 1
            continue
            
        current_block += char
        if char == '{':
            brace_depth += 1
        elif char == '}':
            brace_depth -= 1
            if brace_depth == 0:
                blocks.append(current_block.strip())
                current_block = ""
        i += 1
        
    if current_block.strip():
        blocks.append(current_block.strip())
    return blocks

def get_selector(block):
    # Strip comments first
    clean = re.sub(r'/\*.*?\*/', '', block, flags=re.DOTALL).strip()
    match = re.match(r'^([^{]+)', clean)
    if match:
        return match.group(1).strip()
    return clean

def get_section(selector):
    sel = selector.lower()
    
    # Specific overrides
    if any(x in sel for x in ["lang-selector", "lang-select", "lang-selector-wrapper", "dropdown"]):
        return "1. Header & Navigation"
    if any(x in sel for x in ["lang-card", "de-card", "uk-card", "ua-card"]):
        return "2. Hero Section & Animations"
    if "pricing" in sel or "theme-" in sel or "buy-plan" in sel:
        return "8. Pricing Section & Course Slider"
    if "quiz" in sel:
        return "10. Placement Quiz Modal"
    if "payment" in sel or "pmodal" in sel or "pm-" in sel:
        return "12. Payment Modal"
    if "certs-" in sel or "cert-" in sel or "lightbox" in sel:
        return "5. Certifications & Qualifications"
    if "course-" in sel or "practice-" in sel or "phrase-" in sel or "widget-" in sel:
        return "6. Languages / Courses We Teach"
    if "review-" in sel or "reviews" in sel or "carousel-" in sel:
        return "7. Reviews & Testimonials"
    if "contact" in sel or "form-" in sel or "input-" in sel or "textarea" in sel or "form-control" in sel or "form-btn" in sel:
        return "9. Contact Section & Forms"
    if "teacher" in sel or "stat-" in sel or "placeholder-" in sel or "quote" in sel:
        return "4. Teacher / About Section"
    if "premium-features" in sel or "premium-card" in sel or "premium-grid" in sel or "premium-header" in sel or "icon-box" in sel or "premium-divider" in sel:
        return "3. About Us / Premium Features"
    if "hero" in sel or "wave" in sel or "blob" in sel or "floating-star" in sel or "orbit" in sel or "pulse" in sel:
        return "2. Hero Section & Animations"
    if "header" in sel or "logo" in sel or "nav-" in sel or "menu-toggle" in sel:
        return "1. Header & Navigation"
    if "nf-toast" in sel or "toast" in sel:
        return "11. Toast Notifications"
    
    return "0. Root, Reset & Variables"

def run():
    filepath = '/home/user/NovaFlow/index.css'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    top_blocks = parse_inner_blocks(content)
    
    # Structure of grouped CSS
    # section -> { "base": [blocks], "media": { "@media (max-width: 1024px)": [inner_blocks], ... } }
    grouped = {}
    sections_list = [
        "0. Root, Reset & Variables",
        "1. Header & Navigation",
        "2. Hero Section & Animations",
        "3. About Us / Premium Features",
        "4. Teacher / About Section",
        "5. Certifications & Qualifications",
        "6. Languages / Courses We Teach",
        "7. Reviews & Testimonials",
        "8. Pricing Section & Course Slider",
        "9. Contact Section & Forms",
        "10. Placement Quiz Modal",
        "11. Toast Notifications",
        "12. Payment Modal"
    ]
    
    for s in sections_list:
        grouped[s] = {"base": [], "media": {}}
        
    global_print = []
    global_reduced_motion = []
    
    for block in top_blocks:
        if not block:
            continue
            
        clean_block = block.strip()
        
        # Check if it is a media query
        if clean_block.startswith('@media'):
            # Check print or reduced motion
            if 'print' in clean_block:
                global_print.append(clean_block)
                continue
            if 'prefers-reduced-motion' in clean_block:
                global_reduced_motion.append(clean_block)
                continue
                
            # Parse media query name and inner content
            match = re.match(r'^(@media\s*[^{]+)\s*\{(.*)\}\s*$', clean_block, re.DOTALL)
            if match:
                media_query = match.group(1).strip()
                inner_content = match.group(2).strip()
                inner_blocks = parse_inner_blocks(inner_content)
                
                for ib in inner_blocks:
                    if not ib:
                        continue
                    sel = get_selector(ib)
                    sec = get_section(sel)
                    if media_query not in grouped[sec]["media"]:
                        grouped[sec]["media"][media_query] = []
                    grouped[sec]["media"][media_query].append(ib)
            else:
                # Fallback to root if media format doesn't match
                grouped["0. Root, Reset & Variables"]["base"].append(clean_block)
        else:
            sel = get_selector(clean_block)
            sec = get_section(sel)
            grouped[sec]["base"].append(clean_block)
            
    # Now generate the newly structured CSS
    output = []
    output.append("/* =========================================================================\n")
    output.append("   NovaFlow Premium Stylesheet — Modular Responsive Architecture\n")
    output.append("   ========================================================================= */\n\n")
    
    for sec in sections_list:
        output.append(f"/* =========================================================================\n")
        output.append(f"   {sec.upper()}\n")
        output.append(f"   ========================================================================= */\n\n")
        
        # Write base styles
        for block in grouped[sec]["base"]:
            output.append(block + "\n\n")
            
        # Write media query overrides for this section
        if grouped[sec]["media"]:
            output.append(f"/* --- Responsiveness for {sec} --- */\n")
            # Sort media queries by standard viewport max-width descending
            def sort_media(mq):
                val = re.search(r'max-width:\s*(\d+)px', mq)
                if val:
                    return -int(val.group(1))
                return 0
            sorted_mqs = sorted(grouped[sec]["media"].keys(), key=sort_media)
            for mq in sorted_mqs:
                output.append(mq + " {\n")
                for ib in grouped[sec]["media"][mq]:
                    # indent inner block
                    indented = "\n".join("  " + line for line in ib.split("\n"))
                    output.append(indented + "\n\n")
                output.append("}\n\n")
                
    # Add Print styles
    if global_print:
        output.append("/* =========================================================================\n")
        output.append("   PRINT STYLES\n")
        output.append("   ========================================================================= */\n")
        for p in global_print:
            output.append(p + "\n\n")
            
    # Add Reduced Motion
    if global_reduced_motion:
        output.append("/* =========================================================================\n")
        output.append("   REDUCED MOTION SUPPORT\n")
        output.append("   ========================================================================= */\n")
        for rm in global_reduced_motion:
            output.append(rm + "\n\n")
            
    # Write back
    new_css = "".join(output)
    
    # Save a backup first
    os.rename(filepath, filepath + '.bak')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_css)
        
    print("CSS file successfully reorganized and rewritten!")

if __name__ == '__main__':
    run()
