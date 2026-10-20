import struct, zlib, math, re

# Load base image 1024x1024
with open('public/profile.png', 'rb') as f:
    data = f.read()

w, h = struct.unpack('>II', data[16:24])
idat = bytearray()
idx = 8
while idx < len(data):
    l, = struct.unpack('>I', data[idx:idx+4])
    t = data[idx+4:idx+8]
    if t == b'IDAT':
        idat.extend(data[idx+8:idx+8+l])
    idx += 12 + l
decomp = zlib.decompress(bytes(idat))
stride = w * 4
raw = bytearray(w * h * 4)

def paeth(a, b, c):
    p = a + b - c
    pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
    if pa <= pb and pa <= pc: return a
    if pb <= pc: return b
    return c

src_idx = 0
prev = bytearray(stride)
for y in range(h):
    filt_type = decomp[src_idx]; src_idx += 1
    curr = bytearray(stride)
    for x in range(stride):
        filt = decomp[src_idx]; src_idx += 1
        left = curr[x - 4] if x >= 4 else 0
        up = prev[x]
        up_left = prev[x - 4] if x >= 4 else 0
        if filt_type == 0: v = filt
        elif filt_type == 1: v = (filt + left) & 0xff
        elif filt_type == 2: v = (filt + up) & 0xff
        elif filt_type == 3: v = (filt + ((left + up) >> 1)) & 0xff
        elif filt_type == 4: v = (filt + paeth(left, up, up_left)) & 0xff
        curr[x] = v
    raw[y*stride : (y+1)*stride] = curr
    prev = curr

def get_pixel(buf, x, y, width=w, height=h):
    if 0 <= x < width and 0 <= y < height:
        i = (y * width + x) * 4
        return (buf[i], buf[i+1], buf[i+2], buf[i+3])
    return (0, 0, 0, 0)

def set_pixel(buf, x, y, c, width=w, height=h):
    if 0 <= x < width and 0 <= y < height:
        i = (y * width + x) * 4
        if c[3] == 0:
            buf[i] = buf[i+1] = buf[i+2] = buf[i+3] = 0
        elif c[3] == 255 or buf[i+3] == 0:
            buf[i] = c[0]
            buf[i+1] = c[1]
            buf[i+2] = c[2]
            buf[i+3] = c[3]
        else:
            a = c[3] / 255.0
            ia = 1.0 - a
            buf[i] = int(c[0]*a + buf[i]*ia)
            buf[i+1] = int(c[1]*a + buf[i+1]*ia)
            buf[i+2] = int(c[2]*a + buf[i+2]*ia)
            buf[i+3] = max(buf[i+3], c[3])

# Base body with resting arm completely erased and flank cleaned up
body_base = bytearray(raw)

# Clean torso/pants edge
for y in range(480, 620):
    for x in range(595, 606):
        set_pixel(body_base, x, y, get_pixel(raw, 590, y))
for y in range(620, 680):
    for x in range(595, 606):
        set_pixel(body_base, x, y, get_pixel(raw, 590, y))

# Dark outlines on torso edge
for y in range(480, 680):
    set_pixel(body_base, 604, y, (20, 20, 20, 255))
    set_pixel(body_base, 605, y, (20, 20, 20, 255))
    # Erase the entire resting forearm and hand (x >= 606, y >= 490)
    for x in range(606, w):
        set_pixel(body_base, x, y, (0, 0, 0, 0))

# Clear bottom of hand down to y=700
for y in range(680, 710):
    for x in range(600, w):
        set_pixel(body_base, x, y, (0, 0, 0, 0))

# Seamless red sleeve cuff at elbow
for y in range(485, 508):
    for x in range(612, 655):
        if get_pixel(body_base, x, y)[3] == 0:
            set_pixel(body_base, x, y, (188, 44, 44, 255))
    if get_pixel(body_base, 655, y)[3] == 0:
        set_pixel(body_base, 655, y, (20, 20, 20, 255))

# Extract forearm and hand from raw
elbow_x, elbow_y = 636, 498
wrist_len = 85

forearm_part = []
hand_part = []
for y in range(495, 685):
    for x in range(605, 680):
        c = get_pixel(raw, x, y)
        if c[3] > 40:
            if y < 585:
                forearm_part.append((x - elbow_x, y - elbow_y, c))
            else:
                hand_part.append((x - elbow_x, y - (elbow_y + wrist_len), c))

def render_articulated_arm(frame, angle_forearm_deg, angle_hand_rel_deg, offset_x=0, offset_y=0):
    rad_arm = math.radians(angle_forearm_deg)
    cos_arm, sin_arm = math.cos(rad_arm), math.sin(rad_arm)
    
    # Forearm rotation around elbow
    for rx, ry, c in forearm_part:
        nx = int(round(rx * cos_arm - ry * sin_arm)) + elbow_x + offset_x
        ny = int(round(rx * sin_arm + ry * cos_arm)) + elbow_y + offset_y
        for ox in (0, 1):
            for oy in (0, 1):
                set_pixel(frame, nx + ox, ny + oy, c)
        
    # Wrist joint position in world space
    wx = int(round(0 * cos_arm - wrist_len * sin_arm)) + elbow_x + offset_x
    wy = int(round(0 * sin_arm + wrist_len * cos_arm)) + elbow_y + offset_y
    
    # Hand rotation around wrist
    rad_hand = math.radians(angle_forearm_deg + angle_hand_rel_deg)
    cos_hand, sin_hand = math.cos(rad_hand), math.sin(rad_hand)
    for rx, ry, c in hand_part:
        nx = int(round(rx * cos_hand - ry * sin_hand)) + wx
        ny = int(round(rx * sin_hand + ry * cos_hand)) + wy
        for ox in (0, 1):
            for oy in (0, 1):
                set_pixel(frame, nx + ox, ny + oy, c)

# Parse basketball SVG
svg_path = 'public/pixel-basketball.svg'
with open(svg_path, 'r') as f:
    svg_text = f.read()

ball_16 = [[(0, 0, 0, 0) for _ in range(16)] for _ in range(16)]
def hex_to_rgba(hex_str):
    h = hex_str.lstrip('#')
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)

rect_pattern = re.compile(r'<rect\s+x=\"(\d+)\"\s+y=\"(\d+)\"\s+width=\"(\d+)\"\s+height=\"(\d+)\"\s+fill=\"(#[0-9a-fA-F]+)\"')
for match in rect_pattern.finditer(svg_text):
    rx, ry, rw, rh, fill = match.groups()
    rx, ry, rw, rh = int(rx), int(ry), int(rw), int(rh)
    rgba = hex_to_rgba(fill)
    for dy in range(rh):
        for dx in range(rw):
            if 0 <= ry+dy < 16 and 0 <= rx+dx < 16:
                ball_16[ry+dy][rx+dx] = rgba

def rotate_and_draw_ball(frame, center_x, center_y, angle_deg, scale=10):
    rad = math.radians(angle_deg)
    cos_a = math.cos(rad)
    sin_a = math.sin(rad)
    size = 16 * scale
    cx, cy = size / 2.0, size / 2.0
    for by in range(size):
        for bx in range(size):
            dx = bx - cx
            dy = by - cy
            sx = int(round((dx * cos_a + dy * sin_a) / scale + 7.5))
            sy = int(round((-dx * sin_a + dy * cos_a) / scale + 7.5))
            if 0 <= sx < 16 and 0 <= sy < 16:
                c = ball_16[sy][sx]
                if c[3] > 0:
                    fx = int(center_x - cx + bx)
                    fy = int(center_y - cy + by)
                    set_pixel(frame, fx, fy, c)

def draw_sparkle(frame, cx, cy, color=(251, 237, 100, 255)):
    # Retro star sparkle
    pts = [(0,0), (-1,0), (1,0), (0,-1), (0,1), (-2,0), (2,0), (0,-2), (0,2)]
    for dx, dy in pts:
        for ox in (0, 1):
            for oy in (0, 1):
                set_pixel(frame, cx + dx*3 + ox, cy + dy*3 + oy, color)

def save_spritesheet(filename, frames_list, num_frames, frame_w=1024, frame_h=1024, downscale=2):
    out_frame_w = frame_w // downscale
    out_frame_h = frame_h // downscale
    sheet_w = out_frame_w * num_frames
    sheet_h = out_frame_h
    raw_sheet = bytearray()

    for dy in range(sheet_h):
        raw_sheet.append(0) # filter type 0
        sy = dy * downscale
        for f_idx in range(num_frames):
            curr_frame = frames_list[f_idx]
            for dx in range(out_frame_w):
                sx = dx * downscale
                idx = (sy * frame_w + sx) * 4
                raw_sheet.extend(curr_frame[idx : idx + 4])

    def chunk(tag, c_data):
        return struct.pack('>I', len(c_data)) + tag + c_data + struct.pack('>I', zlib.crc32(tag + c_data) & 0xffffffff)

    ihdr = struct.pack('>IIBBBBB', sheet_w, sheet_h, 8, 6, 0, 0, 0)
    idat = zlib.compress(bytes(raw_sheet), 9)
    png_bytes = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', idat) + chunk(b'IEND', b'')

    with open(filename, 'wb') as out_f:
        out_f.write(png_bytes)
    print(f'Saved {filename}: {sheet_w}x{sheet_h} ({len(png_bytes)//1024} KB)')

# ==========================================
# BUILD BASKETBALL SPRITESHEET (8 FRAMES)
# ==========================================
basket_frames = []
# Arm holds upright: forearm at -166 deg, hand straight up at -8 deg
# Larger basketball: scale=10 (160px diameter in 1024, 80px in 512)
# Center at (664, 245) atop index fingertip
for i in range(8):
    f = bytearray(body_base)
    # Subtle breathing bob
    dy_torso = -4 if (2 <= i <= 5) else 0
    
    render_articulated_arm(f, -166, -8, offset_x=0, offset_y=dy_torso)
    
    # Ball center atop index finger
    ball_angle = i * 45
    ball_y = 245 + dy_torso
    rotate_and_draw_ball(f, 664, ball_y, ball_angle, scale=10)
    
    # Sparkle stars alternating on frames 1, 3, 5, 7
    if i in (1, 5):
        draw_sparkle(f, 664 + 65, ball_y - 45)
    elif i in (3, 7):
        draw_sparkle(f, 664 - 65, ball_y - 40)

    basket_frames.append(f)

save_spritesheet('public/profile-basket.png', basket_frames, 8)
print("Basketball sprite sheet built successfully with larger ball!")
