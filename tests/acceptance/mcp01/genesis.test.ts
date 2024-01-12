import 'dotenv/config'
import { Wallet, API_NET, API_TARGET, NftManager, mvc } from '../../../src'
import { MVC } from '../../../src/api/MVC'
import { getGenesisIdentifiers } from '../../../src/helpers/contractHelpers'
import { Transaction } from '../../../src/mvc'
import { ContractUtil } from '../../../src/mcp01/contractUtil'
import * as nftProto from '../../../src/mcp01/contract-proto/nft.proto'
ContractUtil.init()

let wallet: Wallet
let wallet2: Wallet
let nftManager: NftManager

jest.setTimeout(30000)
beforeAll(async () => {
  const network = process.env.NETWORK === 'testnet' ? API_NET.TEST : API_NET.MAIN
  const [wif, wif2] = [process.env.WIF, process.env.WIF2] as string[]
  const feeb = 1

  wallet = new Wallet(wif, network, feeb, API_TARGET.MVC)
  wallet2 = new Wallet(wif2, network, feeb, API_TARGET.MVC)
  wallet.api.authorize({ authorization: process.env.METASV_BEARER })
  wallet2.api.authorize({ authorization: process.env.METASV_BEARER })

  nftManager = new NftManager({
    network: network,
    apiTarget: API_TARGET.MVC,
    purse: wif,
    feeb: feeb,
  })
  nftManager.api.authorize({ authorization: process.env.METASV_BEARER })
})

describe('NFT 创世测试', () => {
  it('正常初始化', async () => {
    expect(nftManager).toBeInstanceOf(NftManager)
  })

  it('正常创世', async () => {
    const totalSupply = '2'
    const res = await nftManager.genesis({
      totalSupply,
    })

    console.log(res)

    expect(res.txid).toHaveLength(64)
  })

  it.skip('测试genesis正确生成', async () => {
    const privateKey = mvc.PrivateKey.fromWIF(process.env.WIF)
    const address = privateKey.toAddress(API_NET.TEST)

    const mvcApi = new MVC(API_NET.TEST)
    const nftTxId = '54658d2e8fe424cd2854be67d1218ec1d6030090b88edeed4c8585ce7741d215'
    const nftTXHex = await mvcApi.getRawTxData(nftTxId)
    const nftTx = new Transaction(nftTXHex)
    nftTx.version = 10
    const nftUtxo = nftTx.outputs[1]
    const nftGenesisHash = nftProto.getGenesisHash(nftUtxo.script.toBuffer())
    const nftGenesis = nftProto.getQueryGenesis(nftUtxo.script.toBuffer())
    // console.log({ nftGenesisHash, nftGenesis, cal: '25464b7213d3eb2666bf0d1d696cc992911cd57b' })

    const genesisTxHex =
      '0a0000000161f3006201a30c2884893776224b782f77adef54f6cbb50ca43d2f127ec08062010000006a4730440220146955ac0a85e526b3722c3826c7fc8ca34ea951640485ca23e5124e6d0e1dfe02201ab2f8f01910a8f3752b9e6dadff2aa72e06b96589ea62de86fb44977582b7bd412102a84f4252d3e1f8e64fc2344059236fec73fc89937e9686a21e34273ac0d2eeabffffffff026d0b000000000000fd9d0e0176018801a901ac515301402097dfd76851bf465e8f715593b217714858bbe9570ff3bd5e33840a34e20ff0262102ba79df5f8ae7604a9830f03c7933028186aede0675a16f025dc4f8be8eec0382201008ce7480da41702918d1ec8e6849ba32b4d65b1e40dc669c31a1e6306b266c0c6d657461636f6e7472616374240000000000000000000000000000000000000000000000000000000000000000000000005779567985011455930079012493007901149300795893007958930079011493007901249300795293012679610079547f75517a756161007901007e81517a75615a9c6901267961007901687f776100005279517f75007f77007901fd87635379537f75517f7761007901007e81517a7561537a75527a527a5379535479937f75537f77527a75517a67007901fe87635379557f75517f7761007901007e81517a7561537a75527a527a5379555479937f75557f77527a75517a67007901ff87635379597f75517f7761007901007e81517a7561537a75527a527a5379595479937f75597f77527a75517a675379517f75007f7761007901007e81517a7561537a75527a527a5379515479937f75517f77527a75517a6868685179517a75517a75517a75517a7561517a7561007982775179517961517951795c79940124937f7551795c79947f77517a75517a75615279527961517951795a799458937f7551795a79947f7761007901007e81517a7561517a75517a75615379537961517951795c799458937f7551795c79947f7761007901007e81517a7561517a75517a7561007952799f69012b7961007901687f7501447f77517a7561005479011179876351517a755179557a75547a547a547a547a68567956796151795179011279940114937f755179011279947f770801000000030000000115797e87517a75517a7561695679567961517951795b799452937f7551795b799451937f7701007e815a7952949c517a75517a7561695679567961517951795b79947f7551795b799451947f77016a87517a75517a75616900799163567956795679557951946153795379011179947f75517958615179517951938000795179827751947f75007f77517a75517a75517a75617e54795479011479947f755479011379947f777e52797e54795479011579947f777e517a75517a75517a75517a75610079a8012679012679012679537957790131790131795679567956795679011179013679013679013679013679615b7901207f755b79aa87695a795a7955795579557955796155795c7f75587f7761007901007e81517a7561567901307f75607f77567952799f695579827752790128959c695579a8517987695479827701209c6953798277549c69547954797e53797e00795779597951930128957f7559790128957f77876951517a75517a75517a75517a75517a75517a75517a75517a75517a756175527952797e0079567987916359795979597959795479615479aa517901207f758769007901207f7761007901007e81517a75615579607f755c7f7761007901007e81517a7561567901707f7501507f775679827752790128959c695679a8517987695479827701209c69557955797e00795879557951930128957f7555790128957f77876951517a75517a75517a75517a75517a75517a75517a75517a75517a7561756851517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a756175757575757575680121798277557901237952796151795179011379940124937f755179011379947f77517a75517a756187695379012379527961517951790111799458937f755179011179947f7761007901007e81517a7561517a75517a75619c6954790123795279615179517960799458937f7551796079947f7761007901007e81517a7561517a75517a75619c6901227951796151795179011379940114937f755179011379947f770801000000030000000116797e87517a75517a756169012279517961517951795c799452937f7551795c799451937f7701007e815b7952949c517a75517a756169012279517961517951795c79947f7551795c799451947f77016a87517a75517a756169577957795779006153795379011279947f75517958615179517951938000795179827751947f75007f77517a75517a75517a75617e54795479011579947f755479011479947f777e52797e54795479011679947f777e517a75517a75517a75517a75610079a901247953796151795179011379940114937f755179011379947f77517a75517a756151798769005679587951949e635a795b7982775a79597951936153795379011579947f75517958615179517951938000795179827751947f75007f77517a75517a75517a75617e54795479011879947f755479011779947f777e52797e54795479011979947f777e517a75517a75517a75517a7561007901267961007958805279610079827700517902fd009f63517951615179517951938000795179827751947f75007f77517a75517a75517a7561517a75675179030000019f6301fd527952615179517951938000795179827751947f75007f77517a75517a75517a75617e517a756751790500000000019f6301fe527954615179517951938000795179827751947f75007f77517a75517a75517a75617e517a75675179090000000000000000019f6301ff527958615179517951938000795179827751947f75007f77517a75517a75517a75617e517a7568686868007953797e517a75517a75517a75617e517a75517a7561527a75517a756801257901247961007958805279610079827700517902fd009f63517951615179517951938000795179827751947f75007f77517a75517a75517a7561517a75675179030000019f6301fd527952615179517951938000795179827751947f75007f77517a75517a75517a75617e517a756751790500000000019f6301fe527954615179517951938000795179827751947f75007f77517a75517a75517a75617e517a75675179090000000000000000019f6301ff527958615179517951938000795179827751947f75007f77517a75517a75517a75617e517a7568686868007953797e517a75517a75517a75617e517a75517a756100012279827700a063012279527f7502006a87690122790061007958805279610079827700517902fd009f63517951615179517951938000795179827751947f75007f77517a75517a75517a7561517a75675179030000019f6301fd527952615179517951938000795179827751947f75007f77517a75517a75517a75617e517a756751790500000000019f6301fe527954615179517951938000795179827751947f75007f77517a75517a75517a75617e517a75675179090000000000000000019f6301ff527958615179517951938000795179827751947f75007f77517a75517a75517a75617e517a7568686868007953797e517a75517a75517a75617e517a75517a7561517a75680001247900a063012579610123790122797e01147e51797e0123797e0121797e517a7561007901267961007958805279610079827700517902fd009f63517951615179517951938000795179827751947f75007f77517a75517a75517a7561517a75675179030000019f6301fd527952615179517951938000795179827751947f75007f77517a75517a75517a75617e517a756751790500000000019f6301fe527954615179517951938000795179827751947f75007f77517a75517a75517a75617e517a75675179090000000000000000019f6301ff527958615179517951938000795179827751947f75007f77517a75517a75517a75617e517a7568686868007953797e517a75517a75517a75617e517a75517a7561527a75517a7568537953797e52797e51797eaa007901367961007982775179517958947f7551790128947f77517a75517a756187695e795e796151795179011579940114937f755179011579947f77517a75517a75610079013679a98769013479013679ac69013679011979615179012079012079210ac407f0e4bd44bfc207355a778b046225a7068fc59ee7eda43ad905aadbffc800206c266b30e6a1319c66dc401e5bd6b432ba49688eecd118297041da8074ce08100122795679615679aa0079610079517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e01007e81517a75615779567956795679567961537956795479577995939521414136d08c5ed2bf3ba048afe6dcaebafeffffffffffffffffffffffffffffff00517951796151795179970079009f63007952799367007968517a75517a75517a7561527a75517a517951795296a0630079527994527a75517a6853798277527982775379012080517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e01205279947f7754537993527993013051797e527e54797e58797e527e53797e52797e57797e0079517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a756100795779ac517a75517a75517a75517a75517a75517a75517a75517a75517a7561517a75517a7561777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777776a4c990000000000000000000000000000000000000000000000000000000000000000000000002898b1dc02e7eafaa2c3d7143a5a4708930a549de8030000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000030000006d657461636f6e747261637496000000ff683bf376000000001976a9142898b1dc02e7eafaa2c3d7143a5a4708930a549d88ac00000000'
    const genesisTx = new Transaction(genesisTxHex)
    genesisTx.version = 10
    const unlockContractCodeHashArray = ContractUtil.unlockContractCodeHashArray
    // genesis:d19256c13428d653a7d13937a4c7a7d74b13c25d
    // codehash:48d6118692b459fabfc2910105f38dda0645fb57
    // sensibleId:b081766cdff8fd72a567628c4643e60b372398947aaa7aa84d8c8b1facdc6cde00000000

    const res = getGenesisIdentifiers({
      genesisTx,
      purse: { address, privateKey },
      unlockContractCodeHashArray,
      type: 'nft',
    })

    console.log(res)
  })
})
