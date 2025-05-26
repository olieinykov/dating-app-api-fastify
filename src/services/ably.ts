import Ably from 'ably';
import env from '../config/env.js'

const ablyRest = new Ably.Rest(env.ably.token!);

export default ablyRest;