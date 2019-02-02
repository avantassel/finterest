const vow = require('vow');
const amortize = require('amortize');
const prompt = require('prompt');
const chalk = require('chalk');
const numeral = require('numeral');
const moment = require('moment');
const Quandl = require("quandl");

function Finterest() { };

Finterest.prototype.run = function(){

  var response30 = [];
  var response15 = [];
  var pMonths = 0;
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
      ${chalk.bold('Freddie Mac 30 Year Rate as of '+response30[0]+' '+chalk.green(response30[1]+'%'))}
      ${chalk.bold('Freddie Mac 15 Year Rate as of '+response15[0]+' '+chalk.green(response15[1]+'%'))}
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

          // ensure number
          result.amount = +result.amount;
          result.rate30yr = +result.rate30yr;
          result.rate15yr = +result.rate15yr;
          result.principalPayment = +result.principalPayment;

          var amz30 = amortize({
            amount: result.amount,
            rate: result.rate30yr,
            totalTerm: 360,
            amortizeTerm: 360
          });

          var amz30p = amortize({
            amount: result.amount,
            rate: result.rate30yr,
            totalTerm: 360,
            amortizeTerm: 360,
            principalPayment: result.principalPayment
          });
          // update 30 yr payment with principal
          amz30p.payment = amz30.payment + result.principalPayment;

          var amz15 = amortize({
            amount: result.amount,
            rate: result.rate15yr,
            totalTerm: 180,
            amortizeTerm: 180
          });

          var amz15p = amortize({
            amount: result.amount,
            rate: result.rate15yr,
            totalTerm: 180,
            amortizeTerm: 180,
            principalPayment: result.principalPayment
          });
          // update 15 yr payment with principal
          amz15p.payment = amz15.payment + result.principalPayment;

      // 30 year details
      console.log(
      `
      ${chalk.underline.bold('30 Year @ '+result.rate30yr+'%')}
      ${chalk.yellow('Total Paid: $'+numeral(amz30.principal+amz30.interest).format('0,0,0.00'))}
      ${chalk.cyan('Monthly Payment: $'+numeral(amz30.payment).format('0,0.00'))}
      ${chalk.red('Interest Paid: $'+numeral(amz30.interest).format('0,0.00'))}
      ${chalk.green('Paid Off: '+moment().add(360,'M').format('MMMM YYYY'))}
      ${chalk.green('Paying more in principal starts: '+moment().add(amz30.principalBreakingTerm, 'M').format('MMMM YYYY')+' ('+moment().add(amz30.principalBreakingTerm, 'M').fromNow()+')')}

      ${chalk.bold('With $'+numeral(result.principalPayment).format('0,0.00')+' extra monthly principal payment')}
      ${chalk.yellow('Total Paid: $'+numeral(amz30p.principal+amz30p.interest).format('0,0.00'))}
      ${chalk.cyan('Monthly Payment: $'+numeral(amz30p.payment).format('0,0.00'))}
      ${chalk.red('Interest Paid: $'+numeral(amz30p.interest).format('0,0.00'))}
      ${chalk.red('Extra Principal Paid: $'+numeral(amz30p.principalPaymentsTotal).format('0,0.00'))}
      ${chalk.green('Interest Saved: $'+numeral(amz30.interest-amz30p.interest).format('0,0.00'))}
      ${chalk.green('Years Saved: '+numeral((amz30p.termsSaved/12).toFixed(2)).format('0,0.00'))}
      ${chalk.green('Paid Off: '+moment().add(360-amz30p.termsSaved,'M').format('MMMM YYYY'))}
      ${chalk.green('Paying more in principal starts: '+moment().add(amz30p.principalBreakingTerm, 'M').format('MMMM YYYY')+' ('+moment().add(amz30p.principalBreakingTerm, 'M').fromNow()+')')}
      `);

      // 15 year details
      console.log(
      `
      ${chalk.underline.bold('15 Year @ '+result.rate15yr+'%')}
      ${chalk.yellow('Total Paid: $'+numeral(amz15.principal+amz15.interest).format('0,0.00'))}
      ${chalk.cyan('Monthly Payment: $'+numeral(amz15.payment).format('0,0.00'))}
      ${chalk.red('Interest Paid: $'+numeral(amz15.interest).format('0,0.00'))}
      ${chalk.green('Paid Off: '+moment().add(180,'M').format('MMMM YYYY'))}
      ${chalk.green('Paying more in principal starts: '+moment().add(amz15.principalBreakingTerm, 'M').format('MMMM YYYY')+' ('+moment().add(amz15.principalBreakingTerm, 'M').fromNow()+')')}

      ${chalk.bold('With $'+numeral(result.principalPayment).format('0,0.00')+' extra monthly principal payment')}
      ${chalk.yellow('Total Paid: $'+numeral(amz15p.principal+amz15p.interest).format('0,0.00'))}
      ${chalk.cyan('Monthly Payment: $'+numeral(amz15p.payment).format('0,0.00'))}
      ${chalk.red('Interest Paid: $'+numeral(amz15p.interest).format('0,0.00'))}
      ${chalk.red('Extra Principal Paid: $'+numeral(amz15p.principalPaymentsTotal).format('0,0.00'))}
      ${chalk.green('Interest Saved: $'+numeral(amz15.interest-amz15p.interest).format('0,0.00'))}
      ${chalk.green('Years Saved: '+numeral((amz15p.termsSaved/12).toFixed(2)).format('0,0.00'))}
      ${chalk.green('Paid Off: '+moment().add(180-amz15p.termsSaved,'M').format('MMMM YYYY'))}
      ${chalk.green('Paying more in principal starts: '+moment().add(amz15p.principalBreakingTerm, 'M').format('MMMM YYYY')+' ('+moment().add(amz15p.principalBreakingTerm, 'M').fromNow()+')')}
      `);

      // Diff
      console.log(
      `
      ${chalk.underline.bold('15 Year vs 30 Year Difference')}
      ${chalk.cyan('Monthly Difference: $'+numeral(amz30.payment-amz15.payment).format('0,0.00'))}
      ${chalk.green('$'+numeral(amz30.interest-amz15.interest).format('0,0.00')+' will be saved in interest!')}
      ${chalk.green('Paying more in principal than interest starts '+moment().add(amz15.principalBreakingTerm, 'M').to(moment().add(amz30.principalBreakingTerm, 'M'), true)+' sooner')}

      ${chalk.bold('With $'+numeral(result.principalPayment).format('0,0.00')+' extra monthly principal payment')}
      ${chalk.cyan('Monthly Difference: $'+numeral(amz30p.payment-amz15p.payment).format('0,0.00'))}
      ${chalk.green('$'+numeral(amz30p.interest-amz15p.interest).format('0,0.00')+' will be saved in interest!')}
      ${chalk.green('Paying more in principal than interest starts '+moment().add(amz15p.principalBreakingTerm, 'M').to(moment().add(amz30p.principalBreakingTerm, 'M'), true)+' sooner')}
      `);
    });
  });
};

module.exports = Finterest;
