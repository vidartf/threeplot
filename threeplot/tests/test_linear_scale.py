#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import pytest

from ..scales.linear import LinearScaleWidget


def test_linearscale_creation_blank():
    w = LinearScaleWidget()
