
export
interface IHasLabelStyle {
  label_format: string,
  label_color: string | null;
}

export
interface IGridlineStyle extends IHasLabelStyle {
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
interface ITickStyle extends IHasLabelStyle {
  line_color: string | null,
  line_width: number | null,
  tick_length: number,
  direction: 'in' | 'out',
}

export
interface IAxisStyle {
  label: string,
  line_color: string | null,
  line_width: number | null,
  minor_tick_format: ITickStyle,
  major_tick_format: ITickStyle,
}


