import { Web } from '@_koii/sdk/web'
import Arweave from 'arweave'

export const koiTools = new Web()

export const KoiTool = Web
export default Arweave.init({ host: 'arweave.net', protocol: 'https', port: 443 })
