var vow = require('vow');
var amortize = require('amortize');
var prompt = require('prompt');
var chalk = require('chalk');
var numeral = require('numeral');
var Quandl = require("quandl");

function Finterest() { };

Finterest.prototype.run = function(){

  var response30 = [], response15 = [];
  var quandl = new Quandl({auth_token: "Spf5bFDtFkwQ5oqCMy6J"});

  console.log(
  `
  ${chalk.bold('Getting Current Interest Rates...')}
  `);

  function getRates(term){
    var deferred = vow.defer();
    quandl.dataset({ source: "FMAC", table: term }, function(err, response){
        if(err)
            throw err;
        deferred.resolve(JSON.parse(response));
    });
    return deferred.promise();
  }

  getRates("FIX30YR")
    .then(function(response){
      if(response && response.dataset){
        response30 = response.dataset.data[0];
        return getRates("FIX15YR");
      }
    })
    .then(function(response){
      if(response && response.dataset){
        response15 = response.dataset.data[0];
      }
    })
    .then(function(){
      if(!response30.length && !response15.length){
        console.log(
        `
        ${chalk.bold.red('Failed fetching data from Quandl.  Please check your API key.')}
        `);
        return;
      }

      console.log(
      `
      ${chalk.bold('Freddie Mac 30 Year Rate as of '+response30[0]+' '+response30[1]+'%')}
      ${chalk.bold('Freddie Mac 15 Year Rate as of '+response15[0]+' '+response15[1]+'%')}
      ${chalk.bold.blue('Hit enter to accept default values')}
      `);

      prompt.start();

      var prompts = [
        { name: 'amount', message: 'Enter the amount of your loan $200,000:', default: 200000}
        ,{ name: 'rate30yr', message: 'Enter the 30 year rate '+response30[1]+'%', default: response30[1]}
        ,{ name: 'rate15yr', message: 'Enter the 15 year rate '+response15[1]+'%', default: response15[1]}
        ,{ name: 'principalPayment', message: 'Enter the amount of your monthly principal payment $200:', default: 200}
      ];

      prompt.get(prompts, function (err, result) {
          var amz30p = amortize({
            amount: result.amount,
            rate: result.rate30yr,
            totalTerm: 360,
            amortizeTerm: 360,
            principalPayment: result.principalPayment
          });

          var amz30 = amortize({
            amount: result.amount,
            rate: result.rate30yr,
            totalTerm: 360,
            amortizeTerm: 360
          });

          var amz15p = amortize({
            amount: result.amount,
            rate: result.rate15yr,
            totalTerm: 180,
            amortizeTerm: 180,
            principalPayment: result.principalPayment
          });

          var amz15 = amortize({
            amount: result.amount,
            rate: result.rate15yr,
            totalTerm: 180,
            amortizeTerm: 180
          });

      // 30 year details
      console.log(
      `
      ${chalk.bold('30 Year')}
      ${chalk.yellow('Total Paid: $ '+numeral(amz30.principal+amz30.interest).format())}
      ${chalk.cyan('Monthly Payment: $ '+numeral(amz30.payment).format())}
      ${chalk.red('Interest Paid: $ '+numeral(amz30.interest).format())}

      ${chalk.bold('30 Year with an extra monthly principal payment')}
      ${chalk.yellow('Total Paid: $ '+numeral(amz30p.principal+amz30p.interest).format())}
      ${chalk.cyan('Monthly Payment: $ '+numeral(amz30p.payment).format())}
      ${chalk.red('Interest Paid: $ '+numeral(amz30p.interest).format())}
      ${chalk.red('Extra Principal Paid: $ '+numeral(amz30p.principalPaymentsTotal).format())}
      ${chalk.green('Interest Saved: $ '+numeral(amz30.interest-amz30p.interest).format())}
      ${chalk.green('Years Saved: '+numeral((amz30p.termsSaved/12).toFixed(2)).format('0.00'))}
      `);

      // 15 year details
      console.log(
      `
      ${chalk.bold('15 Year')}
      ${chalk.yellow('Total Paid: $ '+numeral(amz15.principal+amz15.interest).format())}
      ${chalk.cyan('Monthly Payment: $ '+numeral(amz15.payment).format())}
      ${chalk.red('Interest Paid: $ '+numeral(amz15.interest).format())}

      ${chalk.bold('15 Year with an extra monthly principal payment')}
      ${chalk.yellow('Total Paid: $ '+numeral(amz15p.principal+amz15p.interest).format())}
      ${chalk.cyan('Monthly Payment: $ '+numeral(amz15p.payment).format())}
      ${chalk.red('Interest Paid: $ '+numeral(amz15p.interest).format())}
      ${chalk.red('Extra Principal Paid: $ '+numeral(amz15p.principalPaymentsTotal).format())}
      ${chalk.green('Interest Saved: $ '+numeral(amz15.interest-amz15p.interest).format())}
      ${chalk.green('Years Saved: '+numeral((amz15p.termsSaved/12).toFixed(2)).format('0.00'))}
      `);

      // Diff
      console.log(
      `
      ${chalk.bold('15 Year vs 30 Year')}
      ${chalk.green('Interest Saved: $ '+numeral(amz30.interest-amz15.interest).format())}
      `);
    });
  });
};

module.exports = Finterest;
