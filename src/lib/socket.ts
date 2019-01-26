import io from 'socket.io-client'

/**
 * Adapter class for handling persistent socket connections
 * @export
 * @class SocketIOAdapter
 * @property {SocketIOClient.Socket} _connection
 */
export class SocketIOAdapter {
  // Private variables for the SocketIOAdapter class
  private _connection: SocketIOClient.Socket

  /**
   * Creates an instance of SocketIOAdapter.
   * @param {string} url
   * @param {string} [path]
   * @memberof SocketIOAdapter
   */
  constructor(url: string, path?: string) {
    this._connection = io(url, {
      path
    })

    this._connection.on('cmd', this._handleCommand)
  }

  /**
   * Handler function for the 'cmd' socket event
   * @private
   * @param {string} msg
   * @memberof SocketIOAdapter
   */
  private _handleCommand(msg: string) {
    console.log(`Socket Command: ${msg}`)
  }
}
