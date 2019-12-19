/*
* @poppinss/fancy-logs
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import figures from 'figures'
import { format } from 'util'
import stringWidth from 'string-width'
import { serializeError } from 'serialize-error'
import { Colors, FakeColors } from '@poppinss/colors'
import { ActionsList, MessageNode, DeferredMessageNode } from './contracts'

/**
 * Logger exposes the API to print fancy logs to the console.
 */
export class Logger {
  /**
   * List of actions that can be logged using the logger
   */
  public actions: ActionsList = {
    success: {
      color: 'green',
      badge: figures.tick,
      logLevel: 'info',
    },
    fatal: {
      color: 'red',
      badge: figures.cross,
      logLevel: 'error',
    },
    error: {
      color: 'red',
      badge: figures.cross,
      logLevel: 'error',
    },
    info: {
      color: 'blue',
      badge: figures.info,
      logLevel: 'info',
    },
    complete: {
      color: 'cyan',
      badge: figures.checkboxOn,
      logLevel: 'info',
    },
    pending: {
      color: 'magenta',
      badge: figures.checkboxOff,
      logLevel: 'info',
    },
    create: {
      color: 'green',
      badge: figures.tick,
      logLevel: 'info',
    },
    update: {
      color: 'yellow',
      badge: figures.tick,
      logLevel: 'info',
    },
    delete: {
      color: 'blue',
      badge: figures.tick,
      logLevel: 'info',
    },
    watch: {
      color: 'yellow',
      badge: figures.ellipsis,
      logLevel: 'info',
    },
    start: {
      color: 'green',
      badge: figures.play,
      logLevel: 'info',
    },
    stop: {
      color: 'magenta',
      badge: figures.squareSmallFilled,
      logLevel: 'info',
    },
    compile: {
      color: 'yellow',
      badge: figures.pointer,
      logLevel: 'info',
    },
    skip: {
      color: 'magenta',
      badge: figures.bullet,
      logLevel: 'info',
    },
    warn: {
      color: 'yellow',
      badge: figures.warning,
      logLevel: 'info',
    },
  }

  /**
   * Reference to colors, fake colors are used when `fake` is
   * set to true
   */
  private _colors: Colors | FakeColors

  /**
   * Array of logs collected when logger was paused. Helps in
   * collecting logs and then filtering them during resume.
   */
  private _deferredLogs: DeferredMessageNode[] = []

  /**
   * Is logger paused from printing logs
   */
  private _isPaused: boolean = false

  /**
   * Length of the biggest label to keep all log messages
   * justified
   */
  private _biggestLabel: number

  /**
   * An array of logs collected only when `fake` is set
   * to true
   */
  public logs: string[] = []

  constructor (private _baseOptions?: Partial<Exclude<MessageNode, 'message'>> & { fake?: boolean }) {
    this._configure()
    this._computeBiggestLabel()
  }

  /**
   * Configures the logger
   */
  private _configure () {
    this._baseOptions = Object.assign({
      color: true,
      icon: true,
      underline: true,
      fake: false,
    }, this._baseOptions)

    this._colors = this._baseOptions!.fake ? new FakeColors() : new Colors()
  }

  /**
   * Computes the length of the biggest label including it's icon. Required
   * to justify content
   */
  private _computeBiggestLabel () {
    this._biggestLabel = Math.max(...Object.keys(this.actions).map((name: keyof ActionsList) => {
      const action = this.actions[name]
      const badge = this._colors[action.color](action.badge)
      const label = this._colors[action.color]().underline(name)
      return stringWidth(`${badge}  ${label}`)
    }))
  }

  /**
   * Returns the base message node
   */
  private _normalizeMessage (message: string | MessageNode): MessageNode {
    /**
     * Message itself is an error object, so we add icon, color and underline
     * to props to it
     */
    if (message['stack']) {
      const serializedMessage = serializeError(message)
      serializedMessage['icon'] = this._baseOptions!.icon
      serializedMessage['color'] = this._baseOptions!.color
      serializedMessage['underline'] = this._baseOptions!.underline
      return serializedMessage as MessageNode
    }

    /**
     * Message is a string, so we use the defaults + the message text
     */
    if (typeof (message) === 'string') {
      return Object.assign({}, this._baseOptions, { message })
    }

    /**
     * Message is an object, but it's message is an error object. In that
     * case, we merge the props of message with the defaults and then
     * copy them over the message.message error object. CONFUSED?
     */
    if (message.message['stack']) {
      const serializedMessage = serializeError(message.message)
      const options = Object.assign({}, this._baseOptions, message)
      serializedMessage['icon'] = options.icon
      serializedMessage['color'] = options.color
      serializedMessage['underline'] = options.underline
      return serializedMessage as MessageNode
    }

    return Object.assign({}, this._baseOptions, message)
  }

  /**
   * Returns whitespace for a given length
   */
  private _getWhitespace (length: number): string {
    return this._baseOptions!.fake ? ' ' : new Array(length + 1).join(' ')
  }

  /**
   * Returns the icon for a given action type
   */
  private _getIcon (name: keyof ActionsList, messageNode: Partial<MessageNode>): string {
    const action = this.actions[name]
    if (this._baseOptions!.fake) {
      return ''
    }

    if (!messageNode.icon) {
      return this._getWhitespace(3)
    }

    if (!messageNode.color) {
      return `${action.badge}${this._getWhitespace(2)}`
    }

    return `${this._colors[action.color](action.badge)}${this._getWhitespace(2)}`
  }

  /**
   * Returns the label for a given action type
   */
  private _getLabel (name: keyof ActionsList, messageNode: Partial<MessageNode>): string {
    const action = this.actions[name]

    if (messageNode.color && messageNode.underline) {
      return this._colors.underline()[action.color](name) as string
    }

    if (messageNode.color) {
      return this._colors[action.color](name) as string
    }

    return name
  }

  /**
   * Returns the prefix for the message
   */
  private _getPrefix (messageNode: Partial<MessageNode>): string {
    if (messageNode.prefix) {
      return `${this._colors.dim(messageNode.prefix)}${this._getWhitespace(1)}`
    }
    return ''
  }

  /**
   * Returns the suffix for the message
   */
  private _getSuffix (messageNode: Partial<MessageNode>): string {
    if (messageNode.suffix) {
      return `${this._getWhitespace(1)}${this._colors.dim().yellow(messageNode.suffix)}`
    }
    return ''
  }

  /**
   * Formats error message
   */
  private _formatStack (name: keyof ActionsList, message: Error | MessageNode) {
    if (name !== 'fatal' || !message['stack']) {
      return message.message
    }

    const stack = message['stack'].split('\n')
    return `${stack.shift()}\n${stack.map((line) => {
      return `${this._colors.dim(line)}`
    }).join('\n')}`
  }

  /**
   * Invokes `console[logMethod]`, gives opportunity to overwrite the
   * method during extend
   */
  protected $log (logMethod: string, message: string, args: any[]) {
    console[logMethod](message, ...args)
  }

  /**
   * Prints message node to the console
   */
  protected $printMessage (message: DeferredMessageNode) {
    const prefix = this._getPrefix(message)
    const icon = this._getIcon(message.action, message)
    const label = this._getLabel(message.action, message)
    const formattedMessage = this._formatStack(message.action, message)
    const suffix = this._getSuffix(message)

    if (this._baseOptions!.fake) {
      const log = format(`${prefix}${icon}${label} ${formattedMessage}${suffix}`, ...message.args)
      this.logs.push(log)
      return log
    }

    const method = this.actions[message.action].logLevel === 'error' ? 'error' : 'log'

    /**
     * Justification whitespace is required justify the text after the
     * icon and label
     */
    const justifyWhitespace = this._getWhitespace((this._biggestLabel - stringWidth(`${icon}${label}`)) + 2)
    this.$log(
      method,
      `${prefix}${icon}${label}${justifyWhitespace}${formattedMessage}${suffix}`,
      message.args,
    )
  }

  /**
   * Log message for a given action
   */
  public log (name: keyof ActionsList, messageNode: string | Error | MessageNode, ...args: string[]) {
    const normalizedMessage = this._normalizeMessage(messageNode)
    const message = Object.assign({ action: name, args }, normalizedMessage)

    if (this._isPaused) {
      this._deferredLogs.push(message)
      return
    }

    return this.$printMessage(message)
  }

  /**
   * Print success message
   */
  public success (message: string | MessageNode, ...args: string[]) {
    return this.log('success', message, ...args)
  }

  /**
   * Print error message
   */
  public error (message: string | Error | MessageNode, ...args: string[]) {
    return this.log('error', message, ...args)
  }

  /**
   * Print fatal message
   */
  public fatal (message: string | Error | MessageNode, ...args: string[]) {
    return this.log('fatal', message, ...args)
  }

  /**
   * Print info message
   */
  public info (message: string | MessageNode, ...args: string[]) {
    return this.log('info', message, ...args)
  }

  /**
   * Print complete message
   */
  public complete (message: string | MessageNode, ...args: string[]) {
    return this.log('complete', message, ...args)
  }

  /**
   * Print pending message
   */
  public pending (message: string | MessageNode, ...args: string[]) {
    return this.log('pending', message, ...args)
  }

  /**
   * Print create message
   */
  public create (message: string | MessageNode, ...args: string[]) {
    return this.log('create', message, ...args)
  }

  /**
   * Print update message
   */
  public update (message: string | MessageNode, ...args: string[]) {
    return this.log('update', message, ...args)
  }

  /**
   * Print delete message
   */
  public delete (message: string | MessageNode, ...args: string[]) {
    return this.log('delete', message, ...args)
  }

  /**
   * Print watch message
   */
  public watch (message: string | MessageNode, ...args: string[]) {
    return this.log('watch', message, ...args)
  }

  /**
   * Print start message
   */
  public start (message: string | MessageNode, ...args: string[]) {
    return this.log('start', message, ...args)
  }

  /**
   * Print stop message
   */
  public stop (message: string | MessageNode, ...args: string[]) {
    return this.log('stop', message, ...args)
  }

  /**
   * Print compile message
   */
  public compile (message: string | MessageNode, ...args: string[]) {
    return this.log('compile', message, ...args)
  }

  /**
   * Print skip message
   */
  public skip (message: string | MessageNode, ...args: string[]) {
    return this.log('skip', message, ...args)
  }

  /**
   * Print skip message
   */
  public warn (message: string | MessageNode, ...args: string[]) {
    return this.log('warn', message, ...args)
  }

  /**
   * Pause the logger and collect logs in memory
   */
  public pauseLogger () {
    this._isPaused = true
  }

  /**
   * Resume logger and pass a function to decide whether or not
   * to print the log
   */
  public resumeLogger (filterFn?: (message: DeferredMessageNode) => boolean) {
    this._isPaused = false
    this._deferredLogs.forEach((log) => {
      if (typeof (filterFn) !== 'function' || filterFn(log)) {
        this.$printMessage(log)
      }
    })
  }
}
