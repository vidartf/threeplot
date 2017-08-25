from traitlets import Tuple, Dict


class DefaultDict(Dict):

    def __init__(self, traits, **kwargs):
        """Create a dict trait type from a Python dict.

        Parameters
        ----------

        traits : Dictionary of trait types [ optional ]
            A Python dictionary containing the types that are valid for
            restricting the content of the Dict Container for certain keys.

        """

        default_value = {}
        for key, value in traits.items():
            default_value[key] = value.default_value
        super(DefaultDict, self).__init__(traits=traits, default_value=default_value, **kwargs)
        self.default_value = default_value


class DefaultTuple(Tuple):

    def __init__(self, *traits, **kwargs):
        """Create a tuple from a list, set, or tuple.

        Create a fixed-type tuple with Traits:

        ``t = Tuple(Int(), Str(), CStr())``

        would be length 3, with Int,Str,CStr for each element.

        Parameters
        ----------

        `*traits` : TraitTypes
            the types for restricting the contents of the DefaultTuple. Each positional
            argumentcorresponds to an element of the tuple.  DefaultTuples are of fixed
            length.

        """
        default_value = []
        for value in traits:
            default_value.append(value.default_value)
        super(DefaultTuple, self).__init__(*traits, default_value=default_value, **kwargs)
        self.default_value = default_value
