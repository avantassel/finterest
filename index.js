var amortize = require('amortize');
var prompt = require('prompt');
var chalk = require('chalk');
var numeral = require('numeral');

prompt.start();

prompt.get(['amount', 'rate', 'principalPayment'], function (err, result) {
    var amz30p = amortize({
      amount: result.amount,
      rate: result.rate,
      totalTerm: 360,
      amortizeTerm: 360,
      principalPayment: result.principalPayment
    });

    var amz30 = amortize({
      amount: result.amount,
      rate: result.rate,
      totalTerm: 360,
      amortizeTerm: 360
    });

    var amz15p = amortize({
      amount: result.amount,
      rate: result.rate,
      totalTerm: 180,
      amortizeTerm: 180,
      principalPayment: result.principalPayment
    });

    var amz15 = amortize({
      amount: result.amount,
      rate: result.rate,
      totalTerm: 180,
      amortizeTerm: 180
    });

// 30 year details
console.log(
`
${chalk.bold('30 Year')}
${chalk.yellow('Total Loan: $ '+numeral(amz30.principal+amz30.interest).format())}
${chalk.cyan('Monthly Payment: $ '+numeral(amz30.payment).format())}
${chalk.red('Interest Paid: $ '+numeral(amz30.interest).format())}

${chalk.bold('30 Year with an extra monthly princial payment')}
${chalk.yellow('Total Loan: $ '+numeral(amz30p.principal+amz30p.interest).format())}
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
${chalk.yellow('Total Loan: $ '+numeral(amz15.principal+amz15.interest).format())}
${chalk.cyan('Monthly Payment: $ '+numeral(amz15.payment).format())}
${chalk.red('Interest Paid: $ '+numeral(amz15.interest).format())}

${chalk.bold('15 Year with an extra monthly princial payment')}
${chalk.yellow('Total Loan: $ '+numeral(amz15p.principal+amz15p.interest).format())}
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
