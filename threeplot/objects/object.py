#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""
TODO: Add module docstring
"""

from pythreejs import Blackbox
from traitlets import Unicode

from .._frontend import module_name, module_version


class ObjectWidget(Blackbox):
    """TODO: Add docstring here
    """
    _model_name = Unicode('ObjectModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
