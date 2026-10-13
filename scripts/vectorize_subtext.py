import cv2
import numpy as np

img = cv2.imread('public/images/extracted/yaspro-subtext-media-group.png', cv2.IMREAD_UNCHANGED)
if img is None:
    print("Could not load image")
    exit(1)

alpha = img[:, :, 3]

# Upscale 8x using cubic interpolation to smooth pixel edges before contouring
scale = 8
h, w = alpha.shape
up = cv2.resize(alpha, (w * scale, h * scale), interpolation=cv2.INTER_CUBIC)
_, thresh = cv2.threshold(up, 110, 255, cv2.THRESH_BINARY)

# Find contours with tree hierarchy
contours, hierarchy = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_TC89_KCOS)

paths = []
for i, cnt in enumerate(contours):
    epsilon = 0.004 * cv2.arcLength(cnt, True)
    approx = cv2.approxPolyDP(cnt, epsilon, True)
    pts = approx.reshape(-1, 2)
    if len(pts) >= 3:
        d = f'M {pts[0][0]/scale:.2f},{pts[0][1]/scale:.2f} ' + ' '.join([f'L {p[0]/scale:.2f},{p[1]/scale:.2f}' for p in pts[1:]]) + ' Z'
        paths.append(d)

print(f'Generated {len(paths)} path contours')

ts_content = '// Authentic vector paths for MEDIA GROUP subtext extracted directly from yas-pro-media-group.png\n'
ts_content += 'export const YAS_SUBTEXT_MEDIA_GROUP_PATHS = [\n'
for p in paths:
    ts_content += f'  "{p}",\n'
ts_content += '];\n'
ts_content += 'export const YAS_SUBTEXT_VIEWBOX = "0 0 157 9";\n'

with open('src/components/ui/yasproSubtextPaths.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print('Saved src/components/ui/yasproSubtextPaths.ts successfully')
