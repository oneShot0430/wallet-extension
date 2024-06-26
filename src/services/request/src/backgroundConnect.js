import { LONG_LIVED_HANDLER, MESSAGES, PORTS } from 'constants/koiConstants'
import { v4 as uuid } from 'uuid'


export class EventHandler {
  constructor(type, callback, id) {
    this.type = type
    this.callback = callback
    this.id = id
  }
}

export class BackgroundConnect {
  constructor(portName) {
    try {
      this.eventHandlers = []
      this.port = chrome.runtime.connect({ name: `${portName}-${uuid()}` })
      this.port.onMessage.addListener((message) => {
        const _this = this
        this.eventHandlers.forEach(handler => {
          if (LONG_LIVED_HANDLER.includes(handler.type)) {
            if (handler.type == message.type) handler.callback(message)
          } else {
            if (handler.type == message.type && handler.id == message.id) {
              handler.callback(message)
              _this.removeHandler(handler.type, handler.id)
            }
          }
        })
      })
    } catch (error) {
      console.error('Cannot connect---', error)
    }
  }
  postMessage(message) {
    if (!this.port) return
    this.port.postMessage(message)
  }

  addHandler(aHandler) {
    if (LONG_LIVED_HANDLER.includes(aHandler.type)) {
      if (this.eventHandlers.every(handler => handler.type !== aHandler.type)) {
        this.eventHandlers.push(aHandler)
      }
    } else {
      this.eventHandlers.push(aHandler)
    }
  }

  request(type, callback, data, id) {
    const newRequest = new EventHandler(type, callback, id)
    this.addHandler(newRequest)
    this.postMessage({
      type,
      data,
      id
    })
  }

  removeHandler(handlerType, id) {
    this.eventHandlers = this.eventHandlers.filter(handler => 
      !(handler.type == handlerType && handler.id == id))
  }
}
