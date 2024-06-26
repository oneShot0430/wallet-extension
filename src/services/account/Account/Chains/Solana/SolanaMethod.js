import { createTransferInstruction, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID, transfer } from '@solana/spl-token'
import { Connection, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, Transaction } from '@solana/web3.js'
import { ACCOUNT, TYPE } from 'constants/accountConstants'
import { ALL_NFT_LOADED, PATH } from 'constants/koiConstants'
import { findIndex } from 'lodash'
import moment from 'moment'
import { AccountStorageUtils } from 'services/account/AccountStorageUtils'
import { getChromeStorage } from 'utils'
import clusterApiUrl from 'utils/clusterApiUrl'
import * as TokenAssets from 'utils/resolveSolanaNFTs'

export class SolanaMethod {
  #chrome
  constructor(solTool) {
    this.solTool = solTool
    this.#chrome = new AccountStorageUtils(solTool.address)
  }

  async getBalances() {
    const solBalance = await this.solTool.getBalance()
    return { balance: solBalance }
  }

  async loadMyContent() {
    try {
      let nfts
      try {
        nfts = await this.fetchNfts()
        console.log('Fetched contents: ', nfts.length)
      } catch (error) {
        console.error('Unable to fetch SOL content', error)
        const res = {
          contents: [],
          newContents: []
        }
        return res
      }

      /* 
        get nft list for this ETH address from Chrome storage
      */
      const contentList =
        (await getChromeStorage(`${this.solTool.address}_assets`))[
          `${this.solTool.address}_assets`
        ] || []
      console.log('Saved contents: ', contentList.length)

      /*
        There're two cases that NFTs will be filtered:
        - Failed load content (removed on functions cacheNFTs on "background/popupEventHandlers")
        - Out-of-date NFTs
      */
      const solAssetIds = nfts.map((nft) => nft.txId)

      const validContents = contentList.filter((content) => {
        return solAssetIds.indexOf(content.txId) !== -1
      })
      console.log('Up to date saved content: ', validContents.length)

      /* 
        detect new nft(s) that were not saved in Chrome storage
      */
      const storageContentIds = validContents.map((nft) => nft.txId)

      const newContents = nfts.filter((nft) => {
        return storageContentIds.indexOf(nft.txId) === -1
      })

      console.log('New contents: ', newContents.length)

      if (!newContents.length && nfts.length === contentList.length) {
        console.log('ALL NFT LOADED')
        return ALL_NFT_LOADED
      }

      const newContentList = await this.getNftData(newContents, false)
      console.log('newContentList', newContentList)

      const res = {
        contents: [...validContents, ...newContentList],
        newContents
      }
      return res
    } catch (err) {
      console.error('Unable to load SOL content', err)
      throw new Error('Unable to load SOL content')
    }
  }

  async fetchNfts() {
    const METADATA_PROGRAM_ID_PUBLIC_KEY = new PublicKey(
      'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
    )
    if (this.solTool.connection === null) throw new Error('No connection')
    const connection = this.solTool.connection

    // const solanaProvider = await storage.setting.get.solanaProvider()
    // connection = new Connection(clusterApiUrl(solanaProvider), 'confirmed')

    const wallets = [this.solTool.address]
    const tokenAccountsByOwnerAddress = await Promise.all(
      wallets.map(async (address) =>
        connection.getParsedTokenAccountsByOwner(new PublicKey(address), {
          programId: TOKEN_PROGRAM_ID
        })
      )
    )

    const potentialNFTsByOwnerAddress = tokenAccountsByOwnerAddress
      .map((ta) => ta.value)
      .map((value) => {
        const mintAddresses = value
          .map((v) => ({
            mint: v.account.data.parsed.info.mint,
            tokenAmount: v.account.data.parsed.info.tokenAmount
          }))
          .filter(({ tokenAmount }) => {
            // Filter out the token if we don't have any balance
            const ownsNFT = tokenAmount.amount !== '0'
            // Filter out the tokens that don't have 0 decimal places.
            // NFTs really should have 0
            const hasNoDecimals = tokenAmount.decimals === 0
            return ownsNFT && hasNoDecimals
          })
          .map(({ mint }) => mint)
        return { mintAddresses }
      })

    const nfts = await Promise.all(
      potentialNFTsByOwnerAddress.map(async ({ mintAddresses }) => {
        const programAddresses = await Promise.all(
          mintAddresses.map(
            async (mintAddress) =>
              (
                await PublicKey.findProgramAddress(
                  [
                    Buffer.from('metadata'),
                    METADATA_PROGRAM_ID_PUBLIC_KEY.toBytes(),
                    new PublicKey(mintAddress).toBytes()
                  ],
                  METADATA_PROGRAM_ID_PUBLIC_KEY
                )
              )[0]
          )
        )

        let accountInfos = await connection.getMultipleAccountsInfo(programAddresses)
        accountInfos = accountInfos.map((accountInfo, i) => [
          accountInfo,
          potentialNFTsByOwnerAddress.map(({ mintAddresses }) => mintAddresses[i])[0]
        ])

        const nonNullInfos = accountInfos?.filter((a) => !!a[0]) ?? []

        const metadataUrls = nonNullInfos
          .map((x) => [TokenAssets._utf8ArrayToNFTType(x[0]?.data), x[1]])
          .filter((metadataUrl) => !!metadataUrl[0])

        const results = await Promise.all(
          metadataUrls.map(async (item) =>
            fetch(item[0]?.url)
              .then((res) => res.json())
              .catch(() => null)
          )
        )

        const metadatas = results.map((metadata, i) => ({
          metadata,
          type: metadataUrls[i][0].type,
          txId: metadataUrls[i][1]
        }))

        return metadatas.filter((r) => !!r.metadata)
      })
    )
    return nfts[0]
  }

  async getNftData(nfts, getBase64) {
    try {
      let nftContents = await Promise.all(
        nfts.map(async (nft) => {
          try {
            const nftMetadata = nft.metadata
            const token_id = nftMetadata.properties.files[0].uri?.slice(24, 60)
            return {
              name: nftMetadata.name,
              isKoiWallet: false,
              txId: `${nft.txId}`,
              imageUrl: nftMetadata.properties.files[0].uri,
              galleryUrl: `${PATH.GALLERY}#/details/${nft.txId}`,
              koiRockUrl: '',
              isRegistered: false,
              contentType: nftMetadata.properties.category,
              totalViews: 0,
              createdAt: '',
              description: nftMetadata.description,
              type: TYPE.SOLANA,
              address: this.solTool.address
            }
          } catch (error) {
            return null
          }
        })
      )

      // filter failed load contents
      nftContents = nftContents.filter((nft) => !!nft)
      return nftContents
    } catch (error) {
      console.log(error.message)
      return []
    }
  }

  async updateActivities() {
    const connection = new Connection(clusterApiUrl(this.solTool.provider))

    const signatureInfos = await connection.getSignaturesForAddress(this.solTool.keypair.publicKey)

    const transactions = await Promise.all(
      signatureInfos.map(
        async (signatureInfos) => await connection.getTransaction(signatureInfos.signature)
      )
    )

    const accountName = await this.#chrome.getField(ACCOUNT.ACCOUNT_NAME)

    const activities = transactions.map((tx) => {
      const { transaction } = tx

      let source, activityName, expense

      if (transaction.message.accountKeys[0]?.toString() === this.solTool.address) {
        source = transaction.message.accountKeys[1]?.toString()
        activityName = 'Sent SOL'
        expense = Math.abs(tx.meta.postBalances[0] - tx.meta.preBalances[0]) / LAMPORTS_PER_SOL
      } else {
        source = transaction.message.accountKeys[0]?.toString()
        activityName = 'Received SOL'
        expense = Math.abs(tx.meta.postBalances[1] - tx.meta.preBalances[1]) / LAMPORTS_PER_SOL
      }

      return {
        id: transaction.signatures[0],
        activityName,
        expense,
        accountName,
        time: tx.blockTime,
        date: moment(Number(tx.blockTime) * 1000).format('MMMM DD YYYY'),
        source,
        network: this.solTool.provider,
        address: this.solTool.address
      }
    })

    const oldActivites = (await this.#chrome.getActivities()) || []
    const newestOfOldActivites = oldActivites[0]

    if (newestOfOldActivites) {
      const idx = findIndex(activities, (data) => data.id === newestOfOldActivites.id)

      for (let i = 0; i < idx; i++) {
        activities[i].seen = false
      }
    }

    await this.#chrome.setActivities(activities)
  }

  async transfer(_, recipient, qty) {
    return this.solTool.transfer(recipient, qty)
  }

  async loadCollections() {}

  async transactionConfirmedStatus(txHash) {
    /* TODO Minh Vu */
    return { dropped: false, confirmed: true }
  }

  async resendTransaction(txId) {}

  async transferNFT(nftId, recipientAddress, amount = 1) {
    const getSigners = (signerOrMultisig, multiSigners) => {
      return signerOrMultisig instanceof PublicKey
        ? [signerOrMultisig, multiSigners]
        : [signerOrMultisig.publicKey, [signerOrMultisig]]
    }
    try {
      const connection = this.solTool.connection

      const mint = new PublicKey(nftId)

      const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        this.solTool.keypair,
        mint,
        this.solTool.keypair.publicKey
      )

      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        this.solTool.keypair,
        mint,
        new PublicKey(recipientAddress)
      )

      const multiSigners = []
      const [ownerPublicKey, signers] = getSigners(this.solTool.keypair, multiSigners)

      const transaction = new Transaction().add(
        createTransferInstruction(
          senderTokenAccount.address,
          recipientTokenAccount.address,
          ownerPublicKey,
          1,
          multiSigners,
          'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
        )
      )

      const signature = await sendAndConfirmTransaction(connection, transaction, [
        this.solTool.keypair,
        ...signers
      ])

      return signature
    } catch (error) {
      console.error(error)
      return false
    }
  }
}
