export const DEFAULT_SWATCH_STYLE = 'bg-slate-200';

export const SWATCH_STYLES: Readonly<Record<string, string>> = {
    white: 'bg-[#ffffff] border-slate-300',
    beige: 'bg-[#ede4d4] border-[#d8cdb9]',
    gray: 'bg-[#c3c6cb] border-[#adb2b8]',
    brown: 'bg-[#7a573d] border-[#63432c]',
    black: 'bg-[#25282d] border-[#181a1d]',
    navy: 'bg-[#273852] border-[#1b283c]',
    green: 'bg-[#2f543e] border-[#213d2c]',
    other: 'bg-gradient-to-br from-[#edd5d1] via-[#ece5cb] to-[#d0e0ed] border-slate-300',
    floor_natural:
        'bg-[#deb887] border-[#c49f6a] bg-[repeating-linear-gradient(90deg,#deb887,#deb887_12px,#d4ac79_12px,#d4ac79_13px)]',
    floor_dark:
        'bg-[#5c3d28] border-[#452b1b] bg-[repeating-linear-gradient(90deg,#5c3d28,#5c3d28_12px,#503421_12px,#503421_13px)]',
    floor_gray:
        'bg-[#a3a7ad] border-[#8a8e94] bg-[repeating-linear-gradient(90deg,#a3a7ad,#a3a7ad_12px,#95999f_12px,#95999f_13px)]',
    floor_tile:
        'bg-[#e2e4e7] border-[#cbced2] bg-[repeating-linear-gradient(45deg,#e2e4e7,#e2e4e7_8px,#d3d6da_8px,#d3d6da_9px)]',
    wall_bright: 'bg-[#fafafa] border-slate-300',
    wall_beige: 'bg-[#eee7dc] border-[#ded4c5]',
    wall_gray: 'bg-[#cbcfd4] border-[#b4b9bf]',
    wall_accent:
        'bg-[#c08267] border-[#a86e56] bg-gradient-to-br from-[#c08267] to-[#a86e56]',
};
