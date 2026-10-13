import cv2
import numpy as np

img = cv2.imread('public/images/extracted/yaspro-subtext-media-group.png', cv2.IMREAD_UNCHANGED)
alpha = img[:, :, 3]

# Let's write out an SVG with high precision
h, w = alpha.shape

# Threshold to get clean letter shapes
# Let's inspect different threshold values
scale = 10
up = cv2.resize(alpha, (w * scale, h * scale), interpolation=cv2.INTER_LANCZOS4)
_, thresh = cv2.threshold(up, 120, 255, cv2.THRESH_BINARY)

contours, hierarchy = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_TC89_KCOS)

svg_paths = []
for i, cnt in enumerate(contours):
    epsilon = 0.003 * cv2.arcLength(cnt, True)
    approx = cv2.approxPolyDP(cnt, epsilon, True)
    pts = approx.reshape(-1, 2)
    if len(pts) >= 3:
        d = f'M {pts[0][0]/scale:.2f},{pts[0][1]/scale:.2f} ' + ' '.join([f'L {p[0]/scale:.2f},{p[1]/scale:.2f}' for p in pts[1:]]) + ' Z'
        svg_paths.append(d)

svg_str = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" fill="#ffffff" fill-rule="evenodd">\n'
for p in svg_paths:
    svg_str += f'  <path d="{p}" />\n'
svg_str += '</svg>\n'

with open('public/images/extracted/yaspro-subtext-media-group.svg', 'w', encoding='utf-8') as f:
    f.write(svg_str)

print('Saved public/images/extracted/yaspro-subtext-media-group.svg')
