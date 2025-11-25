import { captureException } from './sentry'

export function info(message, meta = {}){
  console.info(message, meta)
}

export function warn(message, meta = {}){
  console.warn(message, meta)
}

export function error(message, meta = {}){
  console.error(message, meta)
  captureException(new Error(message))
}
