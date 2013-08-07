web_page_examples
================
csv_to_datatable.html
--------------------

Uses JQuery to show the functionality of loading CSV data straight into the DataTables jQuery plug-in.


The HTML page consists of a textarea, two buttons and a table. CSV data can be entered straight into the textarea 
and upon clicking the 'Populate' button a table is immediately generated to display the data.

The first line of the CSV data is processed as the header fields and all following lines as data.

To make it easier to test and use, two links have also been included that will direct the user to sites that 
provide the service of generating test CSV data. 
These sites are:  http://http://www.mockaroo.com/ and http://www.generatedata.com/.

There is currently no CSV validation, the script expects CSV data with the same column count in each record.

A working demo of the page can be seen at http://jsfiddle.net/jdany/9kG4S/2/

The scripts used in this example consist of:

jQuery - http://jquery.com/

DataTables - http://www.datatables.net/

jquery-csv - https://code.google.com/p/jquery-csv/

t_account_balance.html
----------------------

Trial page to implement a first pass of basic mechanisms. This will be used in accountset.js 

accountset.js
-------------

This is a library of functions to support bookkeeping tasks. It can be used to build bookkeeping applications.
It provides the ability for:
* Creating user defined Acounts
* Entering transactions
* Displaying a Transaction Trail
* Displaying a Trial Balance
* Displaying T Accounts
* Displaying a Trading and Profit & Loss Report
* Displaying a Balance Sheet

accountset.html
-------------

This is an example page using the accountset.js library to provide a fully functional system, showing the background detail and logic of double entry bookkeeping. 

