export const PALETTE = {
  ui: {
    panel: 0x101a2e,
    panelEdge: 0x29415f,
    text: 0xffffff,
    muted: 0xaec4dd,
    accent: 0xffd166,
    success: 0x38e8b0,
    danger: 0xff5d73,
  },
  biomes: {
    sunnyCity: {
      sky: 0x55b9ff,
      far: 0x9bdcff,
      mid: 0xf5b66d,
      near: 0x6f8799,
      lane: 0x23364a,
      divider: 0xffffff,
      obstacle: 0xff5d73,
      pickup: 0xffd166,
    },
    neonNight: {
      sky: 0x100d2b,
      far: 0x251b58,
      mid: 0x3b2578,
      near: 0x18213d,
      lane: 0x111a31,
      divider: 0x69eaff,
      obstacle: 0xff4fd8,
      pickup: 0x7cf6ff,
    },
    jungleRuins: {
      sky: 0x173d3a,
      far: 0x245e46,
      mid: 0x4c7b45,
      near: 0x354f3e,
      lane: 0x28332d,
      divider: 0xf5e7a1,
      obstacle: 0xff7b45,
      pickup: 0xffe66d,
    },
  },
} as const;

export type BiomeId = keyof typeof PALETTE.biomes;
