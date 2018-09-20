#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
TODO: Add module docstring
"""

from traitlets import Unicode, Instance, Tuple, Dict, CInt, CFloat, Enum
from ipywidgets import widget_serialization
from ipywidgets.widgets.trait_types import Color
from ipyscales import ContinuousScale

from .object import ObjectWidget
from ..trait_types import DefaultDict, DefaultTuple


AxisScale = Instance(ContinuousScale)

def TickStyle(**kwargs):
    """A function for creating a tick style trait"""
    return DefaultDict(traits=dict(
        label_format=Unicode(kwargs.get('label_format', '')),
        label_color=Color(kwargs.get('label_color', None), allow_none=True),
        line_color=Color(kwargs.get('line_color', None), allow_none=True),
        line_width=CFloat(kwargs.get('line_width', None), allow_none=True),
        tick_length=CFloat(kwargs.get('tick_length', 0.1)),
        direction=Enum(['in', 'out'], 'out'),
    ))

def AxisStyle(**kwargs):
    """A function for creating an axis style trait"""
    return DefaultDict(traits=dict(
        label=Unicode(kwargs.get('label', '')),
        line_color=Color(kwargs.get('line_color', None), allow_none=True),
        line_width=CFloat(kwargs.get('line_width', None), allow_none=True),
        minor_tick_format=TickStyle(**kwargs.get('minor_tick_format', dict(
            tick_length=0.05))),
        major_tick_format=TickStyle(**kwargs.get('major_tick_format', dict(
            tick_length=0.1))),
        # TODO: Add axis head (i.e./e.g. arrow head + sizing)
    ))


class AxesCross(ObjectWidget):
    """TODO: Add docstring here
    """
    _model_name = Unicode('AxesCrossModel').tag(sync=True)

    # TODO: Ensure dynamic default of unclamped (identity?) scales
    scales = Tuple(AxisScale, AxisScale, AxisScale).tag(sync=True, **widget_serialization)

    axes_styles = DefaultTuple(
        AxisStyle(label='x', line_color='red'),
        AxisStyle(label='y', line_color='green'),
        AxisStyle(label='z', line_color='blue'),
        ).tag(sync=True)

    line_color = Color('black').tag(sync=True)
    line_width = CFloat(1.0).tag(sync=True)
