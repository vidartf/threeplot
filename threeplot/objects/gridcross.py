#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
TODO: Add module docstring
"""

from traitlets import Unicode, Instance, Tuple, Dict, CInt, CFloat, Bool, Union, Enum
from ipywidgets import widget_serialization
from ipywidgets.widgets.trait_types import Color
from pythreejs import Scene, Object3D, Camera

from .object import ObjectWidget
from ipyscales import ContinuousScale
from ..trait_types import DefaultDict, DefaultTuple


AxisScale = Instance(ContinuousScale)

def GridlineStyle(**kwargs):
    """A function for creating a gridline style value"""
    return dict(
        label_format=kwargs.get('label_format', ''),
        line_color=kwargs.get('line_color', None),
        line_width=kwargs.get('line_width', None),
    )

def GridStyle(**kwargs):
    """A function for creating a grid style value"""
    return dict(
        line_color=kwargs.get('line_color', None),
        line_width=kwargs.get('line_width', None),
        minor_style=GridlineStyle(
            **kwargs.get('minor_style',
                         dict(line_color='#d9d9d9', line_width=1))),
        major_style=GridlineStyle(
            **kwargs.get('major_style',
                         dict(line_color='#a6a6a6', line_width=2))),
        label=kwargs.get('label', ''),
    )

def GridlineStyleTrait(**kwargs):
    """A function for creating a gridline style trait"""
    return DefaultDict(traits=dict(
        label_format=Unicode(kwargs.get('label_format', '')),
        line_color=Color(kwargs.get('line_color', None), allow_none=True),
        line_width=CFloat(kwargs.get('line_width', None), allow_none=True),
    ))

def GridStyleTrait(**kwargs):
    """A function for creating a grid style trait"""
    return DefaultDict(traits=dict(
        line_color=Color(kwargs.get('line_color', None), allow_none=True),
        line_width=CFloat(kwargs.get('line_width', None), allow_none=True),
        minor_style=GridlineStyleTrait(
            **kwargs.get('minor_style',
                         dict(line_color='#d9d9d9', line_width=1))),
        major_style=GridlineStyleTrait(
            **kwargs.get('major_style',
                         dict(line_color='#a6a6a6', line_width=2))),
        label=Unicode(kwargs.get('label', '')),
    ))


class GridCross(ObjectWidget):
    """TODO: Add docstring here
    """
    _model_name = Unicode('GridCrossModel').tag(sync=True)

    # TODO: Ensure dynamic default of unclamped (identity?) scales
    scales = Tuple(AxisScale, AxisScale, AxisScale).tag(sync=True, **widget_serialization)

    grid_styles = DefaultTuple(GridStyleTrait(), GridStyleTrait(), GridStyleTrait(),
                        help='grid styles in the order: XY, XZ, YZ').tag(sync=True)

    autosize_target = Union([Instance(Scene), Instance(Object3D)], allow_none=True).tag(sync=True, **widget_serialization)
    autosize_axes = Union([Bool(), Tuple(Bool(), Bool(), Bool())], default_value=True).tag(sync=True)

    mode = Enum(['min', 'max', 'minmax', 'zero'], 'min').tag(sync=True)

    camera = Instance(Camera, allow_none=True,
        help='Needed for minmax grid mode').tag(sync=True, **widget_serialization)

    tight = Bool(False).tag(sync=True)

    line_color = Color('black').tag(sync=True)
    line_width = CFloat(1.0).tag(sync=True)
