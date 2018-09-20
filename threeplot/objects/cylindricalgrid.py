#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
TODO: Add module docstring
"""

from math import pi

from traitlets import Unicode, Instance, Tuple, Dict, CInt, CFloat, Bool, Union, Enum
from ipywidgets import widget_serialization
from ipywidgets.widgets.trait_types import Color
from pythreejs import Scene, Object3D, Camera
from ipyscales import ContinuousScale

from .object import ObjectWidget
from .gridcross import AxisScale, GridStyleTrait
from ..trait_types import DefaultDict, DefaultTuple


AxisScale = Instance(ContinuousScale)


class CylindricalGrid(ObjectWidget):
    """TODO: Add docstring here
    """
    _model_name = Unicode('CylindricalGridModel').tag(sync=True)

    # TODO: Ensure dynamic default of unclamped (identity?) scales
    scales = Tuple(AxisScale, AxisScale, AxisScale).tag(sync=True, **widget_serialization)

    grid_styles = DefaultTuple(GridStyleTrait(), GridStyleTrait(),
                        help='grid styles in the order: polar, axial').tag(sync=True)

    autosize_target = Union([Instance(Scene), Instance(Object3D)], allow_none=True).tag(sync=True, **widget_serialization)
    autosize_axes = Union([Bool(), Tuple(Bool(), Bool(), Bool())], default_value=True).tag(sync=True)

    mode = Enum(['min', 'max', 'minmax', 'zero'], 'min').tag(sync=True)

    tight = Bool(False).tag(sync=True)

    line_color = Color('black').tag(sync=True)
    line_width = CFloat(1.0).tag(sync=True)
