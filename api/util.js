const SECOND = "second"
const MINUTE = "minute"
const HOUR = "hour"
const DAY = "DAY"

const NOT_SCHEDULED = 'not_scheduled'
const SCHEDULED = 'scheduled'
const EXECUTING = 'executing'
const FAILED = 'failed'
const EXECUTED = 'executed'



const interval_to_seconds = (interval) => {
  const vals = interval.split(" ")
  const factor = parseInt(vals[0])
  const unit = vals[1]

  switch(unit){
    case SECOND:
      return factor
    break;
    case MINUTE:
      return factor * 60
    break;
    case HOUR:
      return factor * 60 * 60
    break;
    case DAY:
      return factor * 60 *60 * 24
    break;
  }
}

const timestamp = (now = new Date()) => (Math.floor(now.getTime() / 1000))
const get_shard_number = (max) => Math.floor(Math.random() * max );

module.exports = {
  interval_to_seconds,
  timestamp,
  get_shard_number,
  NOT_SCHEDULED,
  SCHEDULED,
  EXECUTING,
  FAILED,
  EXECUTED
}