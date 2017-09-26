

export
interface IGridlineStyle {
  label_format: string,
  line_color: string | null,
  line_width: number | null,
}

export
interface IGridStyle {
  label: string,
  line_color: string | null,
  line_width: number | null,
  major_style: IGridlineStyle,
  minor_style: IGridlineStyle,
}

export
const N_MAJOR_TICKS = 3;

export
const N_MINOR_TICKS = 10;
