// Figure out how to append to dynamic element from html side where = "$("body").append(table);" is called, hard coded at the moment
// Solution to above: return table;
//Functions:http://stackoverflow.com/questions/336859/var-functionname-function-vs-function-functionname
//Prototypes:
/*

function spy1(name){
  this.name = name;
  var secret;
  this.setSecret = function(message){
    secret = message;
  };
  this.getSecret = function(){
   return secret;
  };
}

function spy2(name){
  this.name = name;
  this.secret;

}
spy2.prototype.setSecret = function(message){
  this.secret = message;

};
spy2.prototype.getSecret = function(){
  return this.secret;


};

bond = new spy1("007");
smart = new spy2("86");

*/

(function() {
var accountset = window.accountset = {

    createBook: function(){
      var obj = new accountset.books();
      return obj;
    },

    //Books class -----------------------------------------------------------------------------------
    books: function (){
          //Create arrays to store object references    
          this.t_account_obj_list = new Array();
          this.account_obj_list = new Array();
          this.transaction_obj_list = new Array();
          this.journal_entry_obj = new accountset.journal_entry();

          this.get_accounts_details=get_accounts_details;
          function get_accounts_details(){
            for(var i=0;i<this.account_obj_list.length;i++){
              this.account_obj_list[i].get_acc_details();
            }
          }

        this.reset_accounts = function(){
          this.account_obj_list.length = 0;
          this.transaction_obj_list.length = 0;
          this.t_account_obj_list.length = 0;
          this.update_account_dropdown();          
        }

        //Button Add Journal Line
        this.add=add;
        function add(){
        console.log("btnadd_jnl_line");
          var acc = $("#journal_acc_select").val();
          var db_amnt = $("#jnl_db_amnt").val();
          var cr_amnt = $("#jnl_cr_amnt").val();
          var lines = this.add_journal_entry(acc+","+db_amnt+","+cr_amnt);
          //show_journal_entry();
          for (var i=0;i<lines.length;i++)
              {
              console.log("lines: ["+i+"] "+lines[i]);
              }
         
        }

        //Button Post Journal Line
        this.post=post;
        function post(){
          this.post_journal_lines();

          //Move to library get_transaction_lines() function in books()
          for(var i=0;i<this.transaction_obj_list.length;i++){  
            for(var j=0;j< this.transaction_obj_list[i].lines.length;j++) {
              console.log("html: " + this.transaction_obj_list[i].lines[j]);
            }
          }
        }        

        //Create T Accounts
        this.create_taccounts=create_taccounts;
        function create_taccounts(){
        //Reset object list and clear html tables
        $("#taccounts_wrapper").remove();  
        this.t_account_obj_list.length = 0;
          var html_string = '<div id="taccounts_wrapper">';
            //Crete T Account objects from array
            for(var i=0; i<books.get_account_names().length; i++){
                var t_account_obj = new accountset.t_account(books.get_account_names()[i]); 
                console.log("Accounts: " + books.get_account_names()[i]);
                this.t_account_obj_list.push(t_account_obj);
                html_string += this.t_account_obj_list[i].create_table();
                console.log("index: " + i);

            }  
            html_string += '</div>';
            return html_string;        
        }

        //Button Cancel Last Journal Line
        this.cancel=cancel;
        function cancel(){
            this.cancel_last_journal_line();          
        }

          this.create_tran_trail=create_tran_trail;
          function create_tran_trail(){
            $("#tran_trail_table").remove();
            var table =  '<table id ="tran_trail_table">' +
                          '<tr>' +
                            '<td>Transaction</td>' +                          
                            '<td>Account:</td>' +                          
                            '<td>Db Amount:</td>' +
                            '<td>Cr Amount:</td>' +
                          '</tr>' +
                        '</table>';            
                $("#transaction_trail").append(table);             

          }

          this.populate_tran_trail=populate_tran_trail;
          function populate_tran_trail(){
              var transactions = this.get_transactions();
              var acc;
              var debit;
              var credit;
              var tran_num = 0;

              for(var i=0; i<transactions.length;i+=4){
                tran_num = transactions[i];
                acc = transactions[i+1];
                debit = transactions[i+2];
                credit = transactions[i+3];
                console.log("populate_tran_trail: " + tran_num  + ", "+ acc  + ", "+ debit + ", "+ credit);
                if (debit == "0") {
                  debit = "";
                }
                if (credit == "0") {
                  credit = "";
                }
               var row =  '<tr class="tran_trail_row">' +
                          '<td>' + tran_num + '</td>' +               
                          '<td>' + acc + '</td>' +
                          '<td>' + debit + '</td>' +
                          '<td>' + credit + '</td>' +     
                          '<tr>';                                      

              $("#tran_trail_table tr :last").after(row);
              }      
          }

          this.get_transactions=get_transactions;
          function get_transactions(){
                      var array = new Array();
                      console.log("Transaction Trail");
                      var tran_cnt = this.transaction_obj_list.length;
                      for(var j=0; j < tran_cnt; j++)
                      {
                        var transaction = this.transaction_obj_list[j];
                        var tran_num = (j + 1);
                        var line_cnt = transaction.lines.length;
                        var line;
                        for(var k=0; k < line_cnt; k++)
                        {
                          line = transaction.lines[k];
                          elements = line.split(",");
                          line = elements[0] + " " + elements[1] + "  " + elements[2];
                          array.push(tran_num, elements[0],elements[1],elements[2]);
                        } 
                      }
                      return array;
          }          

          this.create_trial_balance=create_trial_balance;
          function create_trial_balance(){
            //Show nothing if no balances present
            $("#trial_balance_table").remove();            
            if(this.get_balances().length > 0){
              var table =  '<table id ="trial_balance_table">' +
                            '<tr>' +
                              '<td>Account:</td>' +                          
                              '<td>Db Amount:</td>' +
                              '<td>Cr Amount:</td>' +
                            '</tr>' +
                          '</table>';            
                  $("#trial_balance").append(table);
            }             
          }

          this.populate_trial_balance=populate_trial_balance;
          function populate_trial_balance(){

              var balances = this.get_balances();
              var acc;
              var debit;
              var credit;

              //Return nothing if there are no transactions (get_balances)
              if(balances.length > 0){
                  for(var i=0; i<balances.length;i+=3){
                    acc = balances[i];
                    debit = balances[i+1];
                    credit = balances[i+2];
                    console.log("populate_balances: " + acc  + ", "+ debit + ", "+ credit);

                   var row =  '<tr class="balance_row">' +
                              '<td>' + acc + '</td>' +
                              '<td>' + debit + '</td>' +
                              '<td>' + credit + '</td>' +     
                              '</tr>';                                      

                  $("#trial_balance_table tr :last").after(row);
                  }      
              }
          }

          this.get_balances=get_balances;
          function get_balances(){
                      var array = new Array();
                      console.log("Trial Balance");
                        var tot_debit = 0;
                        var tot_credit = 0;

                      for (var i=0;i<this.account_obj_list.length;i++){
                        var name = this.account_obj_list[i].name;
                        var sum_debit = 0;
                        var sum_credit = 0;

                        var tran_cnt = this.transaction_obj_list.length;
                        for(var j=0; j < tran_cnt; j++)
                        {
                          var transaction = this.transaction_obj_list[j];
                          var line_cnt = transaction.lines.length;
                          var line;
                          for(var k=0; k < line_cnt; k++)
                          {
                            line = transaction.lines[k];
                            elements = line.split(",");
                            if (elements[1] == "") {
                              elements[1] = 0;
                            }
                            if (elements[2] == "") {
                              elements[2] = 0;
                            }
                            if (name == elements[0]) {
                              sum_debit += parseInt(elements[1]);
                              sum_credit += parseInt(elements[2]);
                            }
                          } 
                        }
                        if (sum_debit < sum_credit) {
                              sum_credit -= sum_debit;
                              sum_debit -= sum_debit;
                            } else {
                              if (sum_debit > sum_credit) {
                              sum_debit -= sum_credit;
                              sum_credit -= sum_credit;
                                  } else {
                                    sum_debit = 0;
                                    sum_credit = 0;
                                  }
                            }
                        if ((sum_debit != 0) || (sum_credit != 0)) {
                          tot_debit += sum_debit;
                          tot_credit += sum_credit;
                          console.log("totals:" + tot_debit + " " + tot_credit);
                          if (sum_debit == 0) {
                            sum_debit = "";
                          }
                          if (sum_credit == 0) {
                            sum_credit = "";
                          }
                          array.push(name,sum_debit,sum_credit);
                        }
                      }
                      if(array.length > 0){
                      array.push("",tot_debit,tot_credit);
                      }
                      return array;
          }          

          this.create_tpl_report=create_tpl_report;
          function create_tpl_report(){
            $("#tpl_report_table").remove();
            var table = '<div id="tpl_report_wrapper">' + 
                        '<table id ="tpl_report_table">' +
                          '<tr>' +
                            '<td></td>' +                          
                            '<td></td>' +
                            '<td></td>' +
                          '</tr>' +
                        '</table>' +
                        '</div>';            
                return table;             
          }

          this.populate_tpl_report=populate_tpl_report;
          function populate_tpl_report(){
              var lines = this.get_tpl_lines();
              var text;
              var col1;
              var col2;

              for (var i=0;i<lines.length;i+=3){
                text = lines[i];
                col1 = lines[i+1];
                col2 = lines[i+2];
                if ((col1!="")&&(col1 < 0)) {
                  col1 = "("+(col1 * -1)+")";
                }
                if ((col2!="")&&(col2 < 0)) {
                  col2 = "("+(col2 * -1)+")";
                }
                if (col1 == 0) {
                  col1 = "";
                }
                if (col2 == 0) {
                  col2 = "";
                }
                var row =  '<tr>' +
                           '<td>' + text + '</td>' +
                           '<td>' + col1 + '</td>' +
                           '<td>' + col2 + '</td>' +     
                           '</tr>';                                      

                $("#tpl_report_table tr :last").before(row);
              }
          }

          this.get_tpl_lines=get_tpl_lines;
          function get_tpl_lines(){
            var array = new Array();
            var text = "";
            var col1_val = 0;
            var col2_val = 0;
            var sales_line = new Array();
            var purchases_line = new Array();
            var item_line = new Array();
            var sales_amnt = 0;
            var purchase_amnt = 0;
            var item_amnt = 0;
            //Push Sales figure
            for(var i=0; i<this.t_account_obj_list.length; i++){
                var t_account_obj = this.t_account_obj_list[i];
                if (t_account_obj.name == "Sales"){
                  if (t_account_obj.cf_amnt_cr > 0) {
                    col1_val = 0;
                    col2_val = t_account_obj.cf_amnt_cr;
                    sales_amnt = t_account_obj.cf_amnt_cr;
                  } else {
                    col1_val = 0;
                    col2_val = t_account_obj.cf_amnt_db * -1;
                    sales_amnt = t_account_obj.cf_amnt_db * -1;
                  }
                sales_line.push("Sales",col1_val,col2_val);
                }
                if (t_account_obj.name == "Purchases"){
                  if (t_account_obj.cf_amnt_db > 0) {
                    col1_val = t_account_obj.cf_amnt_db;
                    col2_val = 0;
                    purchase_amnt = t_account_obj.cf_amnt_db;
                  } else {
                    col1_val = t_account_obj.cf_amnt_cr * -1;
                    col2_val = 0;
                    purchase_amnt = t_account_obj.cf_amnt_cr * -1;
                  }
                purchases_line.push("Purchases",col1_val,col2_val);
                }
              }
            array.push.apply(array,sales_line);
            //Push 'Cost of Goods Sold' (assume to be purchases)
            array.push("Less Cost of Goods Sold:","","");
            array.push.apply(array,purchases_line);
            //Calculate Gross Profit
            var gross_profit = sales_amnt - purchase_amnt;
            array.push("Gross Profit","",gross_profit);

            //Push 'Less Expenses'
            array.push("Less Expenses:","","");
            //Push 'Expense Items' (loop, and tally total)
            var expense_total = 0;

            for(var i=0; i<this.t_account_obj_list.length; i++){
                var t_account_obj = this.t_account_obj_list[i];
                var account_obj = this.account_obj_list[i];
                if (account_obj.name == "Sales") {
                  continue;
                }
                if (account_obj.name == "Purchases") {
                  continue;
                }
                if (account_obj.report != "T") {
                  continue;
                }
                text = account_obj.name;
                if (t_account_obj.cf_amnt_db > 0) {
                  col1_val = t_account_obj.cf_amnt_db;
                  col2_val = 0;
                  item_amnt = t_account_obj.cf_amnt_db;
                } else {
                  col1_val = t_account_obj.cf_amnt_cr * -1;
                  col2_val = 0;
                  item_amnt = t_account_obj.cf_amnt_cr * -1;
                }
                array.push(text,col1_val,col2_val);
                expense_total += item_amnt;
            }
            array.push("",expense_total,0);
            //Push 'Net Profit'
            var net_profit = gross_profit - expense_total;
            array.push("Net Profit",0,net_profit);
            console.log("Array: " + array);
            return array;
          }


          this.create_bs_report=create_bs_report;
          function create_bs_report(){
            $("#bs_report_table").remove();
            var table = '<div id="bs_report_wrapper">' + 
                        '<table id ="bs_report_table">' +
                          '<tr>' +
                            '<td></td>' +                          
                            '<td></td>' +
                            '<td></td>' +
                          '</tr>' +
                        '</table>' +
                        '</div>';            
                return table;             
          }

          this.populate_bs_report=populate_bs_report;
          function populate_bs_report(){
              var lines = this.get_bs_lines();
              var text;
              var col1;
              var col2;

              for (var i=0;i<lines.length;i+=3){
                text = lines[i];
                col1 = lines[i+1];
                col2 = lines[i+2];
                if ((col1!="")&&(col1 < 0)) {
                  col1 = "("+(col1 * -1)+")";
                }
                if ((col2!="")&&(col2 < 0)) {
                  col2 = "("+(col2 * -1)+")";
                }
                if (col1 == 0) {
                  col1 = "";
                }
                if (col2 == 0) {
                  col2 = "";
                }
                var row =  '<tr>' +
                           '<td>' + text + '</td>' +
                           '<td>' + col1 + '</td>' +
                           '<td>' + col2 + '</td>' +     
                           '</tr>';                                      

                $("#bs_report_table tr :last").before(row);
              }
          }

          this.get_bs_lines=get_bs_lines;
          function get_bs_lines(){
            var array = new Array();
            var text = "";
            var col1_val = 0;
            var col2_val = 0;
            var asset_line = new Array();
            var liability_line = new Array();
            var capital_line = new Array();
            var item_line = new Array();
            var asset_amnt = 0;
            var liability_amnt = 0;
            var asset_liability_amnt = 0;
            var capital_amnt = 0;
            var item_amnt = 0;
            //Push Asset lines
            array.push("Assets:","","");
            for(var i=0; i<this.t_account_obj_list.length; i++){
                var t_account_obj = this.t_account_obj_list[i];
                var account_obj = this.account_obj_list[i];
                if (account_obj.report == "T") {
                  continue;
                }
                if (account_obj.category != "A") {
                  continue;
                }
                text = account_obj.name;
                if (t_account_obj.cf_amnt_db > 0) {
                  col1_val = 0;
                  col2_val = t_account_obj.cf_amnt_db;
                  item_amnt = t_account_obj.cf_amnt_db;
                } else {
                  col1_val = 0;
                  col2_val = t_account_obj.cf_amnt_cr * -1;
                  item_amnt = t_account_obj.cf_amnt_cr * -1;
                }
                array.push(text,col1_val,col2_val);
                asset_amnt += item_amnt;
            }
            array.push("",0,asset_amnt);

            //Push Liability lines
            array.push("Liabilities:","","");
            for(var i=0; i<this.t_account_obj_list.length; i++){
                var t_account_obj = this.t_account_obj_list[i];
                var account_obj = this.account_obj_list[i];
                if (account_obj.report == "T") {
                  continue;
                }
                if (account_obj.category != "L") {
                  continue;
                }
                text = account_obj.name;
                if (t_account_obj.cf_amnt_cr > 0) {
                  col1_val = t_account_obj.cf_amnt_cr;
                  col2_val = 0;
                  item_amnt = t_account_obj.cf_amnt_cr;
                } else {
                  col1_val = t_account_obj.cf_amnt_db * -1;
                  col2_val = 0;
                  item_amnt = t_account_obj.cf_amnt_db * -1;
                }
                array.push(text,col1_val,col2_val);
                liability_amnt += item_amnt;
            }
            array.push("",liability_amnt,0);
            asset_liability_amnt = asset_amnt - liability_amnt;
            array.push("",0,asset_liability_amnt);

            //Push Capital lines
            array.push("Capital:","","");
            for(var i=0; i<this.t_account_obj_list.length; i++){
                var t_account_obj = this.t_account_obj_list[i];
                var account_obj = this.account_obj_list[i];
                if (account_obj.report == "T") {
                  continue;
                }
                if (account_obj.category != "C") {
                  continue;
                }
                text = account_obj.name;
                if (t_account_obj.cf_amnt_db > 0) {
                  col1_val = 0;
                  col2_val = t_account_obj.cf_amnt_db;
                  item_amnt = t_account_obj.cf_amnt_db;
                } else {
                  col1_val = 0;
                  col2_val = t_account_obj.cf_amnt_cr * -1;
                  item_amnt = t_account_obj.cf_amnt_cr * -1;
                }
                array.push(text,col1_val,col2_val);
                capital_amnt += item_amnt;
            }
//            array.push("",0,capital_amnt);


            var tpl_lines = this.get_tpl_lines();
            //Push 'Net Profit' (last item in Capital lines)
            text = "Net Profit";
            var net_profit = tpl_lines[tpl_lines.length - 1];
            if (net_profit > 0) {
              col1_val = 0;
              col2_val = net_profit;
              item_amnt = net_profit;
            }
            array.push(text,col1_val,col2_val);
            capital_amnt += item_amnt;

            array.push("",0,capital_amnt);

            return array;
          }

          this.create_journal=create_journal;
          function create_journal(){
            var table =  '<table id ="journal_table">' +
                          '<tr>' +
                            '<td><label for="jnl_acc">Account:</label></td>' +                          
                            '<td><label for="jnl_db_amnt">Db Amount:</label></td>' +
                            '<td><label for="jnl_cr_amnt">Cr Amount:</label></td>' +
                            '<td></td>' +
                          '</tr>' +
                          '<tr>' +
                          '<td><select id="journal_acc_select">' +
                          '</select></td>' +
                            '<td><input type="text" id="jnl_db_amnt"></td>' +
                            '<td><input type="text" id="jnl_cr_amnt"></td>' +
                            '<td><input type="button" id="btnadd_jnl_line" value="Add Line" onclick="books.add()"></td>' +
                            '<td><input type="button" id="btnpost_jnl_lines" value="Post" onclick="books.post()"></td>' +
                            '<td><input type="button" id="btncancel_jnl_line" value="Cancel" onclick="books.cancel()"></td>' +
                          '</tr>' +
                        '</table>';            
                //return table;                    
                $("#journal_entry").append(table);             

          this.update_account_dropdown();
          }          

          this.update_account_dropdown=update_account_dropdown;
          function update_account_dropdown(){
            //Reset list
            $("#journal_acc_select").html(""); 

            var length = this.account_obj_list.length;
       
            for (var i = 0; i < length; i++) {
                var line = "<option value=" + this.account_obj_list[i].name + ">" + this.account_obj_list[i].name  + "</option>";
                $("#journal_acc_select").append(line);     
              }  
            //Selects first option as default
            $('#journal_acc_select option:first-child').attr("selected", "selected");
          }


          this.add_journal_entry=add_journal_entry;
          function add_journal_entry(line){
              console.log("add_journal_entry");
              this.journal_entry_obj.add_journal_line(line);
              this.journal_entry_obj.create_table();
              //Reset form
              //Clear previously selected option and select first child by default
              $('#journal_acc_select option:selected').removeAttr('selected');
              $('#journal_acc_select option:first-child').attr("selected", "selected");

              $("#jnl_cr_amnt").val("");
              $("#jnl_db_amnt").val("");

              return this.journal_entry_obj.lines;
          }

          this.get_journal_lines=get_journal_lines;
          function get_journal_lines(){
              return this.journal_entry_obj.lines;
          }

          this.post_journal_lines=post_journal_lines;
          function post_journal_lines(){
            console.log("this.journal_entry_obj: " + this.journal_entry_obj.lines);
            console.log("Length before: " + this.transaction_obj_list.length);
            this.transaction_obj_list.push(this.journal_entry_obj);
            console.log("Length after: " + this.transaction_obj_list.length);
            this.journal_entry_obj = new accountset.journal_entry();
            console.log("Length after liones reset");
            $("#journal_table .journal_entry_row").remove();
          }          

          this.cancel_last_journal_line=cancel_last_journal_line;
          function cancel_last_journal_line(){
            $("#journal_table .journal_entry_row :last").remove();
            this.journal_entry_obj.cancel_last_line();
          }   

          this.get_account_names=get_account_names;
          function get_account_names(){
                var account_names = new Array();
                var length = this.account_obj_list.length;
                for(var i=0; i< length;i++){
                  account_names.push(this.account_obj_list[i].name);
                }     
                return account_names;
              }    


          this.create_account=function create_account(accounts_array){
            console.log("create_account: " + accounts_array);


         var new_accounts = new Array();
         var acc_exists = 0;

          ///Validating input    

          if(accounts_array.length == 0){
                alert("Enter an account name");
                return;
          }

          if(accounts_array[0].length == 0){
                alert("Enter an account name");
                return;
          }

          for(var i=0;i<accounts_array.length;i++){
                  var account_line = accounts_array[i];
                  var elements = account_line.split(",");


                  //For empty account list at start
                  if(this.account_obj_list.length == 0){
                    var obj = new accountset.account(elements[0],elements[1],elements[2]);
                    this.account_obj_list.push(obj);   
                  } else {
                      var length = this.account_obj_list.length;
                      acc_exists = 0;
                      for(var j = 0; j<length; j++){
                          if(elements[0].toLowerCase() == this.account_obj_list[j].name.toLowerCase()){
                            acc_exists = 1;                       
                            break;
                          }
                      }

                      if(acc_exists){
                            alert(elements[0] + " account exists"); 
                      } else {
                            var obj = new accountset.account(elements[0],elements[1],elements[2]);
                            this.account_obj_list.push(obj);                        
                      }

                  }
          }

          if(acc_exists){
            return;
          }
            //Update
            this.update_account_dropdown();
          }

          this.create_transaction=create_transaction;
          function create_transaction(db_acc, db_amnt, cr_acc, cr_amnt){
                console.log("create_transaction: " + db_acc + " " + db_amnt + " " + cr_acc + " " + cr_amnt);

                var obj = new accountset.transaction(db_acc, db_amnt, cr_acc, cr_amnt);
                this.transaction_obj_list.push(obj);
                console.log("transaction_obj_list.length: " + this.transaction_obj_list.length); 
                console.log(this.transaction_obj_list);
              }


            //Populate T-Accounts from Transaction List
            this.populate_t_accs=populate_t_accs;
            function populate_t_accs(){        

                     //Remove tran lines
              $(".tran_line").remove();        
              var row = '<tr class="tran_line">' +
                            '<td class="left acc_name"></td>' +
                            '<td class="left acc_amnt"></td>' +
                            '<td class="right acc_name"></td>' +
                            '<td class="right acc_amnt"></td>' +
                            '</tr>';
              $(".empty_row").before(row);

                console.log("populate_t_accs"); 
                account_names = this.get_account_names();
                var t_acc;
                var acc_cnt = account_names.length;
                // Loop through accounts list
                for (var i=0; i< acc_cnt; i++)
                {
                  var curr_acc = account_names[i];
                  // For current account, get t_account object
                  for (var j=0; j< this.t_account_obj_list.length; j++)
                  {
                    if (curr_acc == this.t_account_obj_list[j].name) {
                      t_acc = this.t_account_obj_list[j];
                      break;
                    }
                  }

                  console.log("Cur_acc " + curr_acc);
                  var tran_cnt = this.transaction_obj_list.length;
                  // Loop through transactions list
                  for(var j=0; j < tran_cnt; j++)
                  {
                    var transaction = this.transaction_obj_list[j];
                    var tran_num = "Transaction " + (j + 1);
                    var line_cnt = transaction.lines.length;
                    for(var k=0; k < line_cnt; k++)
                    {
                      // Loop through lines in transaction looking for lines for current account.
                      line = transaction.lines[k];
                      elements = line.split(",");
                      if (elements[0] == curr_acc)
                      {
                        // Add line to T account
                        console.log("Line " + line);
                        // Call populate_tran_line for current account
                        t_acc.populate_tran_line(tran_num,elements[1],elements[2]);
                      }
                    } 
                  }
                }
              }         
    },
    //Books class +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



    //T Account class -------------------------------------------------------------------------------
    t_account: function(name){
        this.name=name;
        this.db_total = 0;
        this.cr_total = 0;    
        this.bd_row = 0;
        this.cf_row = 0;     
        this.bd_amnt_db = 0;
        this.bd_amnt_cr = 0;
        this.cf_amnt_db = 0;     
        this.cf_amnt_cr = 0;     
        this.seq_cnt = 1;

        this.alert=alert;
        function alert()
          {
          console.log("Method called");
          }
        this.create_table=create_table;
        function create_table(){
               var table = '<table id="' + this.name + '" class="taccount">' +
                          '<thead>' +
                          '<tr>' +
                          '<th colspan="4">' + this.name +'</th>' +
                          '<tr>' +
                          '</thead>' +
                          '<tr class="tran_line">' +
                          '<td class="left acc_name"></td>' +
                          '<td class="left acc_amnt"></td>' +
                          '<td class="right acc_name"></td>' +
                          '<td class="right acc_amnt"></td>' +
                          '</tr>' +                      
                          '<tr class="empty_row">' +
                          '<td class="left acc_name"></td>' +
                          '<td class="left acc_amnt"></td>' +
                          '<td class="right acc_name"></td>' +
                          '<td class="right acc_amnt"></td>' +
                          '</tr>' +   
/*                                    
                          '<tr class="tran_total">' +
                          '<td class="left acc_name"></td>' +
                          '<td class="left total"></td>' +
                          '<td class="right acc_name"></td>' +
                          '<td class="right total"></td>' +
                          '</tr>' +
*/                          
                          '</table>';                     
//                $("body").append(table);
                //$("#taccounts").append(table);                
                return table;
//                $(".tran_total").hide();                    
        }

          this.add_rnd_tran_line=add_rnd_tran_line;
          function add_rnd_tran_line(){
            console.log("Total." + this.name + ".");      
            console.log($("#account_id").val());

            var pick_side = Math.floor(Math.random() * 10);
                 if(!$("#" + this.name + " .tran_line").length){
                        console.log("Pick_side " + pick_side);
                        if(pick_side%2){
                          console.log("Empty, Right side " + pick_side);
                            var row = '<tr class="tran_line">' +
                                      '<td class="left acc_name"></td>' +
                                      '<td class="left acc_amnt"></td>' +
                                      '<td class="right acc_name">Account Name</td>' +
                                      '<td class="right acc_amnt">' + Math.floor(Math.random() * 6000) + '</td>' +
                                      '</tr>' +
                                          '<tr class="tran_line">' +
                                          '<td class="left acc_name"></td>' +
                                          '<td class="left acc_amnt"></td>' +
                                          '<td class="right acc_name"></td>' +
                                          '<td class="right acc_amnt"></td>' +
                                          '</tr>';                                       

                        } else {
                            console.log("Empty, Left side " + pick_side);
                            var row = '<tr class="tran_line">' +
                                      '<td class="left acc_name">Account Name</td>' +
                                      '<td class="left acc_amnt">' + Math.floor(Math.random() * 6000) + '</td>' +
                                      '<td class="right acc_name"></td>' +
                                      '<td class="right acc_amnt"></td>' +
                                      '</tr>' +
                                          '<tr class="tran_line">' +
                                          '<td class="left acc_name"></td>' +
                                          '<td class="left acc_amnt"></td>' +
                                          '<td class="right acc_name"></td>' +
                                          '<td class="right acc_amnt"></td>' +
                                          '</tr>';     
                          }

                      } else {
                            console.log("Pick_side " + pick_side);
                            if(pick_side%2){
                            console.log("Not empty, Left side " + pick_side);
                            var name = this.name
                            $("#" + name + " .tran_line").children("td.right.acc_name:empty:first").text("Account Name");
                      $("#" + name + " .tran_line").children("td.right.acc_amnt:empty:first").text(Math.floor(Math.random() * 6000));                          
                            row = '<tr class="tran_line">' +
                                          '<td class="left acc_name"></td>' +
                                          '<td class="left acc_amnt"></td>' +
                                          '<td class="right acc_name"></td>' +
                                          '<td class="right acc_amnt"></td>' +
                                          '</tr>'; 
                            } else {       
                              console.log("Not empty, Right side " + pick_side);
                              var name = this.name
                              $("#" + name + " .tran_line").children("td.left.acc_name:empty:first").text("Account Name");
                      $("#" + name + " .tran_line").children("td.left.acc_amnt:empty:first").text(Math.floor(Math.random() * 6000));

                            row = '<tr class="tran_line">' +
                                          '<td class="left acc_name"></td>' +
                                          '<td class="left acc_amnt"></td>' +
                                          '<td class="right acc_name"></td>' +
                                          '<td class="right acc_amnt"></td>' +
                                          '</tr>';                                       
                            }                   
                      }
    //              console.log("insert row " + row);
                  $("#" + this.name + " .empty_row").before(row);

              }


          this.add_tran_line2=add_tran_line2;
          function add_tran_line2(name, amount){
          console.log("Name: " + name + " Amount: " + amount);

            var account = name;

            var pick_side = Math.floor(Math.random() * 10);
                 if(!$("#" + this.name + " .tran_line").length){
                        console.log("Pick_side " + pick_side);
                        if(pick_side%2){
                          console.log("Empty, Right side " + pick_side);
                            var row = '<tr class="tran_line">' +
                                      '<td class="left acc_name"></td>' +
                                      '<td class="left acc_amnt"></td>' +
                                      '<td class="right acc_name">' + account + '</td>' +
                                      '<td class="right acc_amnt">' + amount + '</td>' +
                                      '</tr>' +
                                          '<tr class="tran_line">' +
                                          '<td class="left acc_name"></td>' +
                                          '<td class="left acc_amnt"></td>' +
                                          '<td class="right acc_name"></td>' +
                                          '<td class="right acc_amnt"></td>' +
                                          '</tr>';                                       

                        } else {
                            console.log("Empty, Left side " + pick_side);
                            var row = '<tr class="tran_line">' +
                                      '<td class="left acc_name">' + account+ '</td>' +
                                      '<td class="left acc_amnt">' + amount + '</td>' +
                                      '<td class="right acc_name"></td>' +
                                      '<td class="right acc_amnt"></td>' +
                                      '</tr>' +
                                          '<tr class="tran_line">' +
                                          '<td class="left acc_name"></td>' +
                                          '<td class="left acc_amnt"></td>' +
                                          '<td class="right acc_name"></td>' +
                                          '<td class="right acc_amnt"></td>' +
                                          '</tr>';     
                          }

                      } else {
                            console.log("Pick_side " + pick_side);
                            if(pick_side%2){
                            console.log("Not empty, Left side " + pick_side);
                            var name = this.name
                            $("#" + name + " .tran_line").children("td.right.acc_name:empty:first").text(account);
                      $("#" + name + " .tran_line").children("td.right.acc_amnt:empty:first").text(amount);                          
                            row = '<tr class="tran_line">' +
                                          '<td class="left acc_name"></td>' +
                                          '<td class="left acc_amnt"></td>' +
                                          '<td class="right acc_name"></td>' +
                                          '<td class="right acc_amnt"></td>' +
                                          '</tr>'; 
                            } else {       
                              console.log("Not empty, Right side " + pick_side);
                              var name = this.name
                              $("#" + name + " .tran_line").children("td.left.acc_name:empty:first").text(account);
                      $("#" + name + " .tran_line").children("td.left.acc_amnt:empty:first").text(amount);

                            row = '<tr class="tran_line">' +
                                          '<td class="left acc_name"></td>' +
                                          '<td class="left acc_amnt"></td>' +
                                          '<td class="right acc_name"></td>' +
                                          '<td class="right acc_amnt"></td>' +
                                          '</tr>';                                      
                            }                           
                    }
    //              console.log("insert row " + row);
                  $("#" + this.name + " .empty_row").before(row);  
                
              }          

          this.populate_tran_line=populate_tran_line;
          function populate_tran_line(name, debit,credit){
          console.log("Name: " + name + " Amount: " + debit + " " + credit);
                                       
            var account = name;

            if ((credit != "0") && (credit != "")){
            var name = this.name
            $("#" + name + " .tran_line").children("td.right.acc_name:empty:first").text(account);
            $("#" + name + " .tran_line").children("td.right.acc_amnt:empty:first").text(credit);                          
            row = '<tr class="tran_line">' +
                          '<td class="left acc_name"></td>' +
                          '<td class="left acc_amnt"></td>' +
                          '<td class="right acc_name"></td>' +
                          '<td class="right acc_amnt"></td>' +
                          '</tr>'; 
            } else {       
              var name = this.name
              $("#" + name + " .tran_line").children("td.left.acc_name:empty:first").text(account);
              $("#" + name + " .tran_line").children("td.left.acc_amnt:empty:first").text(debit);

            row = '<tr class="tran_line">' +
                          '<td class="left acc_name"></td>' +
                          '<td class="left acc_amnt"></td>' +
                          '<td class="right acc_name"></td>' +
                          '<td class="right acc_amnt"></td>' +
                          '</tr>';                                       
            }                           

            $("#" + this.name + " .empty_row").before(row);  
                
          }          


              this.sequence = sequence;
              function sequence(){
              //BUG - Crashes when started on another T Account before the previous one has finished cycle            
                  var time = 500;
                  var steps = 4;
                  var name = this.name;
                  var seq_cnt = this.seq_cnt

                  if($("#" + name + " .tran_total").length == 0){
                      var row = '<tr class="tran_total">' +
                          '<td class="left acc_name"></td>' +
                          '<td class="left total"></td>' +
                          '<td class="right acc_name"></td>' +
                          '<td class="right total"></td>' +
                          '</tr>';
                      $("#" + name + " tr:last").after(row);
                      $("#" + name + ".tran_total").hide();                      
                  }                  

                  if($("#" + name + " .tran_line").length){

                    switch(seq_cnt){
                        case(1): console.log(seq_cnt);
                                  //Totalling both sides
                                  in_sequence = 1;

                                      //Remove empty transaction lines - REVISIT
                                     $("#" + name + " .tran_line").each(function () {
                                              if ($(this).text().trim() == "") {
                                                  $(this).remove();
                                              };
                                      });
                                  this.total();

                                  console.log("Account: " + name);



                                  //Show total line 
                                  $("#" + name + " .tran_total").fadeIn(time);                         
                                  
                                  $("#" + name + " .left.total").text(this.db_total); 
                                  $("#" + name + " .right.total").text(this.cr_total);  
                                 seq_cnt++;
                                 break;

                        case(2): console.log(seq_cnt);
                                  //Populating Brought Down figure
                                  this.close_account();
                                  $("#" + name + " .empty_row").hide();                        
                                  $("#" + name + " .tran_line:last").after(this.bd_row);

                                  $("#" + name + " .bd_line").hide();
                                  $("#" + name + " .bd_line").fadeIn(time);  

                                  /*
                                  if(this.db_total>this.cr_total){
                                    var larger = $(".left.total").text();
                                    var smaller = $(".right.total").text();
                                  } else if(this.db_total<this.cr_total){
                                    var larger = $(".right.total").text();
                                    var smaller = $(".left.total").text();
                                  }
                                  var sum = larger - smaller;                   
                                  */
                                 seq_cnt++;
                                 break;

                        case(3): console.log(seq_cnt);
                                  //Rebalancing Totals
                                  this.total(); 
                                  var element = name;
                                  var cr_total = this.cr_total;
                                  var db_total = this.db_total;                              
                                  $("#" + name + " .tran_total").fadeOut(time, function() {
                                      $("#" + element + " .right.total").text(cr_total)
                                      $("#" + element + " .left.total").text(db_total);                                                
                                    });                                                     
                                  
                                  $("#" + name + " .tran_total").fadeIn(time);
                                 seq_cnt++;
                                 break;

                        case(4): console.log(seq_cnt);
                                  //Populating Carried Forward figure
                                  $("#" + name + " .tran_total").after(this.cf_row);
                                  $("#" + name + " .cf_line").hide();
                                  $("#" + name + " .cf_line").fadeIn(time);                       
                                 seq_cnt++;
                                 break;

                        case(5): console.log(seq_cnt);
                                  //Reset to start state
                                  $("#" + name + " .empty_row").show();          
                                  $("#" + name + " .bd_line").remove();
                                  $("#" + name + " .cf_line").remove();          
                                  $("#" + name + " .right.total").text("");
                                  $("#" + name + " .left.total").text("");  
                                  
                                  //Hide total line 
                                  $("#" + name + " .tran_total").hide();

                                  //Reset accounts to none
                                  $("#" + name + " .tran_line").remove();
                             
                                 seq_cnt = 1;
                                 in_sequence = 0;
                                 break;                       

                        default: console.log("default");
                                 break;                                                                     
                    }
                    this.seq_cnt = seq_cnt;
                  } else {
                    alert("No transactions");
                  }
              }

              this.total=total;
              function total(){
                //Left Total
                console.log($("#account_id").val());
                console.log("Total." + this.name + ".");
                var amnt_array = $("#" + this.name + " .left.acc_amnt").map(function() {
                          if(!$(this).text() == ""){
                         return parseInt($(this).text(), 10);
                          }
                      }).get();

    /*            var length = amnt_array.length;
                for(var i=0;i<length;i++){
                  console.log("LEFT " + amnt_array[i]);
                }
    */
                var total = 0;
                for (var i=0; i < amnt_array.length; i++) {           
                    total += amnt_array[i] ;            
                }

                this.db_total = total;  

              //Right Total
               var amnt_array = $("#" + this.name + " .right.acc_amnt").map(function() {
                          if(!$(this).text() == ""){
                         return parseInt($(this).text(), 10);
                          }
                      }).get();
                total = 0;
                for (var i = 0; i < amnt_array.length; i++) {
                    total += amnt_array[i];              
                }
                this.cr_total = total;

              }

              this.close_account = close_account;
              function close_account(){
                //Calculating Brought Down amount
                var bd_amnt = 0;
                var cf_amnt = 0;
                var res = 0;
/*
                if(this.db_total > this.cr_total){
                  bd_amnt = this.db_total - this.cr_total;
                } else {
                  bd_amnt = this.cr_total - this.db_total;
                }
                console.log("Carried Forward: " + cf_amnt);
*/
                res = this.db_total - this.cr_total;
                if (res > 0)   // DB balance
                {
                  res = Math.abs(res);
                  bd_amnt = res;
                  cf_amnt = res;
                  this.bd_row = '<tr class="bd_line">' +
                                '<td class="left acc_name"></td>' +
                                '<td class="left acc_amnt"></td>' +
                                '<td class="right acc_name">Brought Down</td>' +
                                '<td class="right acc_amnt">' + bd_amnt + '</td>' +
                                '</tr>';   

                  this.cf_row = '<tr class="cf_line">' +
                                '<td class="left acc_name">Carried Forward</td>' +
                                '<td class="left acc_amnt">' + cf_amnt + '</td>' +
                                '<td class="right acc_name"></td>' +
                                '<td class="right acc_amnt"></td>' +
                                '</tr>';
                this.bd_amnt_db = 0;
                this.bd_amnt_cr = bd_amnt;
                this.cf_amnt_db = cf_amnt;
                this.cf_amnt_cr = 0;
                } else {       // CR balance
                  res = Math.abs(res);
                  bd_amnt = res;
                  cf_amnt = res;
                  this.bd_row = '<tr class="bd_line">' +
                                '<td class="left acc_name">Brought Down</td>' +
                                '<td class="left acc_amnt">' + bd_amnt + '</td>' +
                                '<td class="right acc_name"></td>' +
                                '<td class="right acc_amnt"></td>' +
                                '</tr>';

                  this.cf_row = '<tr class="cf_line">' +
                                '<td class="left acc_name"></td>' +
                                '<td class="left acc_amnt"></td>' +
                                '<td class="right acc_name">Carried Forward</td>' +
                                '<td class="right acc_amnt">' + cf_amnt + '</td>' +
                                '</tr>';                        
                this.bd_amnt_db = bd_amnt;
                this.bd_amnt_cr = 0;
                this.cf_amnt_db = 0;
                this.cf_amnt_cr = cf_amnt;
                }            
              }

    },    
    //T Account class +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    //Transaction class -----------------------------------------------------------------------------
    // transaction class
    transaction: function(db_acc, db_amnt, cr_acc, cr_amnt){
   // array = Bank    20  0 Rent    0   40 Cash    20  0
    this.lines = new Array();
    this.lines.push(db_acc + "," + db_amnt + "," + "0");
    this.lines.push(cr_acc + "," + "0"     + "," + cr_amnt);
    },
    //Transaction class +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    // Journal_entry class --------------------------------------------------------------------------
    journal_entry: function(){

          this.lines = new Array();
          this.line;

          this.add_journal_line=add_journal_line
          function add_journal_line(line){
              this.lines.push(line); 
              this.line = line;          
          }

        this.create_table=create_table;
        function create_table(){

              elements = this.line.split(",");
              console.log("elements: " + elements);
              var acc = elements[0];
              var debit = elements[1];
              var credit = elements[2];

               var row =  '<tr class="journal_entry_row">' +
                          '<td>' + acc + '</td>' +
                          '<td>' + debit + '</td>' +
                          '<td>' + credit + '</td>' +     
                          '<tr>';                                      

              $("#journal_table tr :last").after(row);  
          }

          this.cancel_last_line=cancel_last_line;
          function cancel_last_line(){
            this.lines.pop();
          }

    },
    // Journal_entry class ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  //Account class -----------------------------------------------------------------------------------
  account: function(name, report, category){
      this.name = name;
      this.report = report;
      this.category = category;
      /*
      this.id = id;
      */

      this.get_acc_details=get_acc_details;
      function get_acc_details(){
        console.log("Account name: " + this.name + ". Report: " + this.report + ". Category: " + this.category);
      }      

      this.get_acc_details=get_acc_details;
      function get_acc_details(){
        console.log("Account name: " + this.name + ". Report: " + this.report + ". Category: " + this.category);
      }      

  } 
  //Account class +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

}

})();