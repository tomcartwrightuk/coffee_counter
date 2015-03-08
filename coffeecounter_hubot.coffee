# Description:
#  Get coffee stats from FreshPotBot via the coffee_counter app
#
# Commands:
#   jr coffee

module.exports = (robot) ->

  robot.respond /coffee?/, (msg) ->

    robot.http("#{process.env.COFFEE_URL}/stat")
      .headers({"Content-type": "application/json"})
      .get() (err, res, body) ->
        if err
          msg.send "Hmm, there was a problem getting coffee stats"
        else
          response = JSON.parse(body)
          if response.error
            msg.send "Error with coffee stats: #{response.message}"
          else
            msg.send "Last brew: *#{response['mostRecent']}*. \n Today: *#{response['today']}* pots / *#{(response['today']*0.624505).toFixed(2)}* gal. \n Since records began: *#{response['sinceBeginning']}* pots / *#{(response['sinceBeginning']*0.624505).toFixed(2)}* gal."
