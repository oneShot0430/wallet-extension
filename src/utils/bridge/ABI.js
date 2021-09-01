const ABI=[
  {
    'inputs': [
      {
        'internalType': 'address',
        'name': '_koiToken',
        'type': 'address'
      },
      {
        'internalType': 'address',
        'name': '_vault',
        'type': 'address'
      }
    ],
    'stateMutability': 'nonpayable',
    'type': 'constructor'
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': false,
        'internalType': 'address',
        'name': 'user',
        'type': 'address'
      },
      {
        'indexed': false,
        'internalType': 'address',
        'name': 'token',
        'type': 'address'
      },
      {
        'indexed': false,
        'internalType': 'uint256',
        'name': 'id',
        'type': 'uint256'
      },
      {
        'indexed': false,
        'internalType': 'uint256',
        'name': 'amount',
        'type': 'uint256'
      },
      {
        'indexed': false,
        'internalType': 'string',
        'name': 'arAddress',
        'type': 'string'
      }
    ],
    'name': 'Deposit',
    'type': 'event'
  },
  {
    'inputs': [
      {
        'internalType': 'address',
        'name': 'token',
        'type': 'address'
      },
      {
        'internalType': 'uint256',
        'name': 'id',
        'type': 'uint256'
      },
      {
        'internalType': 'uint256',
        'name': 'amount',
        'type': 'uint256'
      },
      {
        'internalType': 'string',
        'name': 'arAddress',
        'type': 'string'
      }
    ],
    'name': 'deposit',
    'outputs': [],
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'inputs': [],
    'name': 'koiToken',
    'outputs': [
      {
        'internalType': 'address',
        'name': '',
        'type': 'address'
      }
    ],
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'inputs': [],
    'name': 'vault',
    'outputs': [
      {
        'internalType': 'address',
        'name': '',
        'type': 'address'
      }
    ],
    'stateMutability': 'view',
    'type': 'function'
  }
]
const ABI2 = [
  {
    'inputs': [
      {
        'internalType': 'string',
        'name': '_name',
        'type': 'string'
      },
      {
        'internalType': 'string',
        'name': '_symbol',
        'type': 'string'
      },
      {
        'internalType': 'address',
        'name': '_proxyRegistryAddress',
        'type': 'address'
      }
    ],
    'stateMutability': 'nonpayable',
    'type': 'constructor'
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': true,
        'internalType': 'address',
        'name': '_owner',
        'type': 'address'
      },
      {
        'indexed': true,
        'internalType': 'address',
        'name': '_operator',
        'type': 'address'
      },
      {
        'indexed': false,
        'internalType': 'bool',
        'name': '_approved',
        'type': 'bool'
      }
    ],
    'name': 'ApprovalForAll',
    'type': 'event'
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': true,
        'internalType': 'address',
        'name': 'previousOwner',
        'type': 'address'
      },
      {
        'indexed': true,
        'internalType': 'address',
        'name': 'newOwner',
        'type': 'address'
      }
    ],
    'name': 'OwnershipTransferred',
    'type': 'event'
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': true,
        'internalType': 'address',
        'name': '_operator',
        'type': 'address'
      },
      {
        'indexed': true,
        'internalType': 'address',
        'name': '_from',
        'type': 'address'
      },
      {
        'indexed': true,
        'internalType': 'address',
        'name': '_to',
        'type': 'address'
      },
      {
        'indexed': false,
        'internalType': 'uint256[]',
        'name': '_ids',
        'type': 'uint256[]'
      },
      {
        'indexed': false,
        'internalType': 'uint256[]',
        'name': '_amounts',
        'type': 'uint256[]'
      }
    ],
    'name': 'TransferBatch',
    'type': 'event'
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': true,
        'internalType': 'address',
        'name': '_operator',
        'type': 'address'
      },
      {
        'indexed': true,
        'internalType': 'address',
        'name': '_from',
        'type': 'address'
      },
      {
        'indexed': true,
        'internalType': 'address',
        'name': '_to',
        'type': 'address'
      },
      {
        'indexed': false,
        'internalType': 'uint256',
        'name': '_id',
        'type': 'uint256'
      },
      {
        'indexed': false,
        'internalType': 'uint256',
        'name': '_amount',
        'type': 'uint256'
      }
    ],
    'name': 'TransferSingle',
    'type': 'event'
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': false,
        'internalType': 'string',
        'name': '_uri',
        'type': 'string'
      },
      {
        'indexed': true,
        'internalType': 'uint256',
        'name': '_id',
        'type': 'uint256'
      }
    ],
    'name': 'URI',
    'type': 'event'
  },
  {
    'inputs': [
      {
        'internalType': 'address',
        'name': '_owner',
        'type': 'address'
      },
      {
        'internalType': 'uint256',
        'name': '_id',
        'type': 'uint256'
      }
    ],
    'name': 'balanceOf',
    'outputs': [
      {
        'internalType': 'uint256',
        'name': '',
        'type': 'uint256'
      }
    ],
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'inputs': [
      {
        'internalType': 'address[]',
        'name': '_owners',
        'type': 'address[]'
      },
      {
        'internalType': 'uint256[]',
        'name': '_ids',
        'type': 'uint256[]'
      }
    ],
    'name': 'balanceOfBatch',
    'outputs': [
      {
        'internalType': 'uint256[]',
        'name': '',
        'type': 'uint256[]'
      }
    ],
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'inputs': [
      {
        'internalType': 'address',
        'name': '_to',
        'type': 'address'
      },
      {
        'internalType': 'uint256[]',
        'name': '_ids',
        'type': 'uint256[]'
      },
      {
        'internalType': 'uint256[]',
        'name': '_quantities',
        'type': 'uint256[]'
      },
      {
        'internalType': 'bytes',
        'name': '_data',
        'type': 'bytes'
      }
    ],
    'name': 'batchMint',
    'outputs': [],
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'inputs': [
      {
        'internalType': 'address',
        'name': '_from',
        'type': 'address'
      },
      {
        'internalType': 'uint256',
        'name': '_id',
        'type': 'uint256'
      },
      {
        'internalType': 'uint256',
        'name': '_quantity',
        'type': 'uint256'
      }
    ],
    'name': 'burnFrom',
    'outputs': [],
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'inputs': [
      {
        'internalType': 'address',
        'name': '_initialOwner',
        'type': 'address'
      },
      {
        'internalType': 'uint256',
        'name': '_initialSupply',
        'type': 'uint256'
      },
      {
        'internalType': 'string',
        'name': '_uri',
        'type': 'string'
      },
      {
        'internalType': 'bytes',
        'name': '_data',
        'type': 'bytes'
      }
    ],
    'name': 'create',
    'outputs': [
      {
        'internalType': 'uint256',
        'name': '',
        'type': 'uint256'
      }
    ],
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'inputs': [
      {
        'internalType': 'uint256',
        'name': '',
        'type': 'uint256'
      }
    ],
    'name': 'creators',
    'outputs': [
      {
        'internalType': 'address',
        'name': '',
        'type': 'address'
      }
    ],
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'inputs': [
      {
        'internalType': 'address',
        'name': '_owner',
        'type': 'address'
      },
      {
        'internalType': 'address',
        'name': '_operator',
        'type': 'address'
      }
    ],
    'name': 'isApprovedForAll',
    'outputs': [
      {
        'internalType': 'bool',
        'name': 'isOperator',
        'type': 'bool'
      }
    ],
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'inputs': [
      {
        'internalType': 'address',
        'name': '_to',
        'type': 'address'
      },
      {
        'internalType': 'uint256',
        'name': '_id',
        'type': 'uint256'
      },
      {
        'internalType': 'uint256',
        'name': '_quantity',
        'type': 'uint256'
      },
      {
        'internalType': 'bytes',
        'name': '_data',
        'type': 'bytes'
      }
    ],
    'name': 'mint',
    'outputs': [],
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'inputs': [],
    'name': 'name',
    'outputs': [
      {
        'internalType': 'string',
        'name': '',
        'type': 'string'
      }
    ],
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'inputs': [],
    'name': 'owner',
    'outputs': [
      {
        'internalType': 'address',
        'name': '',
        'type': 'address'
      }
    ],
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'inputs': [],
    'name': 'renounceOwnership',
    'outputs': [],
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'inputs': [
      {
        'internalType': 'address',
        'name': '_from',
        'type': 'address'
      },
      {
        'internalType': 'address',
        'name': '_to',
        'type': 'address'
      },
      {
        'internalType': 'uint256[]',
        'name': '_ids',
        'type': 'uint256[]'
      },
      {
        'internalType': 'uint256[]',
        'name': '_amounts',
        'type': 'uint256[]'
      },
      {
        'internalType': 'bytes',
        'name': '_data',
        'type': 'bytes'
      }
    ],
    'name': 'safeBatchTransferFrom',
    'outputs': [],
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'inputs': [
      {
        'internalType': 'address',
        'name': '_from',
        'type': 'address'
      },
      {
        'internalType': 'address',
        'name': '_to',
        'type': 'address'
      },
      {
        'internalType': 'uint256',
        'name': '_id',
        'type': 'uint256'
      },
      {
        'internalType': 'uint256',
        'name': '_amount',
        'type': 'uint256'
      },
      {
        'internalType': 'bytes',
        'name': '_data',
        'type': 'bytes'
      }
    ],
    'name': 'safeTransferFrom',
    'outputs': [],
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'inputs': [
      {
        'internalType': 'address',
        'name': '_operator',
        'type': 'address'
      },
      {
        'internalType': 'bool',
        'name': '_approved',
        'type': 'bool'
      }
    ],
    'name': 'setApprovalForAll',
    'outputs': [],
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'inputs': [
      {
        'internalType': 'string',
        'name': '_newBaseMetadataURI',
        'type': 'string'
      }
    ],
    'name': 'setBaseMetadataURI',
    'outputs': [],
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'inputs': [
      {
        'internalType': 'address',
        'name': '_to',
        'type': 'address'
      },
      {
        'internalType': 'uint256[]',
        'name': '_ids',
        'type': 'uint256[]'
      }
    ],
    'name': 'setCreator',
    'outputs': [],
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'inputs': [
      {
        'internalType': 'bytes4',
        'name': '_interfaceID',
        'type': 'bytes4'
      }
    ],
    'name': 'supportsInterface',
    'outputs': [
      {
        'internalType': 'bool',
        'name': '',
        'type': 'bool'
      }
    ],
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'inputs': [],
    'name': 'symbol',
    'outputs': [
      {
        'internalType': 'string',
        'name': '',
        'type': 'string'
      }
    ],
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'inputs': [
      {
        'internalType': 'uint256',
        'name': '',
        'type': 'uint256'
      }
    ],
    'name': 'tokenSupply',
    'outputs': [
      {
        'internalType': 'uint256',
        'name': '',
        'type': 'uint256'
      }
    ],
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'inputs': [
      {
        'internalType': 'uint256',
        'name': '_id',
        'type': 'uint256'
      }
    ],
    'name': 'totalSupply',
    'outputs': [
      {
        'internalType': 'uint256',
        'name': '',
        'type': 'uint256'
      }
    ],
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'inputs': [
      {
        'internalType': 'address',
        'name': 'newOwner',
        'type': 'address'
      }
    ],
    'name': 'transferOwnership',
    'outputs': [],
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'inputs': [
      {
        'internalType': 'uint256',
        'name': '_id',
        'type': 'uint256'
      }
    ],
    'name': 'uri',
    'outputs': [
      {
        'internalType': 'string',
        'name': '',
        'type': 'string'
      }
    ],
    'stateMutability': 'view',
    'type': 'function'
  }
]

module.exports = {
  ABI, ABI2
}
