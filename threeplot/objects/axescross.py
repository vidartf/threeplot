#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
TODO: Add module docstring
"""

from traitlets import Unicode

from .object import ObjectWidget


class AxesCrossWidget(ObjectWidget):
    """TODO: Add docstring here
    """
    _model_name = Unicode('AxesCrossModel').tag(sync=True)
