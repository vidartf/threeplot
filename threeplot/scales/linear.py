#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
TODO: Add module docstring
"""

from traitlets import CFloat, Unicode

from .base import ScaleWidget


class LinearScaleWidget(ScaleWidget):
    """TODO: Add docstring here
    """
    _model_name = Unicode('LinearScaleModel')

    offset = CFloat().tag(sync=True)
    scale = CFloat().tag(sync=True)
