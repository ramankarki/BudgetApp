let budgetController = (function () {

    let Expense = function (id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value,
        this.percentage = -1
    };

    Expense.prototype = {
        calcPercentage: function(totalIncome) {
            if (totalIncome > 0) {
                this.percentage = Math.round((this.value / totalIncome) * 100);
            } else {
                this.percentage = -1;
            }
        },

        getPercentage: function() {
            return this.percentage;
        }
    };

    let Income = function (id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    let calculateTotal = function(type) {
        let sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    return {
        addItem: function (type, des, val) {
            // create new id
            let ID;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // create new object based on inc of exp
            let newItem = type === "exp" ? new Expense(ID, des, val) : new Income(ID, des, val);

            // push into our big data structure
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function(type, id) {
            let ids, index;
            ids = data.allItems[type].map(obj => obj.id);
            index = ids.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            // calculate total income and expenses
            calculateTotal("inc");
            calculateTotal("exp");
            
            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            if (data.totals.inc > 0) {
                // calculate the percentage of income that we spent
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(current => current.calcPercentage(data.totals.inc));
        },

        getPercentages: function() {
            let allPerc = data.allItems.exp.map(current => current.getPercentage());
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function () {
            console.log(data);
        }
    }

})();


let UIController = (function () {

    let DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    };

    let formatNumber = function(num, type) {
        // + or - before number
        // exactly 2 decimals points
        // comma seperating the thousands
        num = Math.abs(num);
        num = num.toFixed(2);
        let numSplit = num.split(".");
        let int = numSplit[0];
        let dec = numSplit[1];

        let formatInt = "";
        if (int.length > 3) {
            let three = int.slice(int.length - 3, int.length);
            formatInt = "," + three + formatInt;
            int = int.slice(0, int.length-3);
            while (int.length > 2) {
                let two = int.slice(int.length-2, int.length);
                formatInt = "," + two + formatInt;
                int = int.slice(0, int.length - 2);
            }
        }

        formatInt = int + formatInt;
        let sign = type === "exp" ? "-" : "+";

        return sign + " " + formatInt + "." + dec;
    };

    let nodeListForEach = function(list, callBack) {
        for (let i = 0; i < list.length; i++) {
            callBack(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        getDOMstrings: function () {
            return DOMstrings;
        },

        addListItem: function (obj, type) {
            // create html string with placeholder text
            let html, element;
            if (type === "inc") {
                element = DOMstrings.incomeContainer;
                html =
                    `<div class="item clearfix" id="inc-${obj.id}">
                        <div class="item__description">${obj.description}</div>
                        <div class="right clearfix">
                            <div class="item__value">${formatNumber(obj.value, type)}</div>
                            <div class="item__delete">
                                <button class="item__delete--btn"><i class="fas fa-minus-circle"></i></button>
                            </div>
                        </div>
                    </div>`;
            } else if (type === "exp") {
                element = DOMstrings.expensesContainer;
                html =
                    `<div class="item clearfix" id="exp-${obj.id}">
                        <div class="item__description">${obj.description}</div>
                        <div class="right clearfix">
                            <div class="item__value">${formatNumber(obj.value, type)}</div>
                            <div class="item__percentage">21%</div>
                            <div class="item__delete">
                                <button class="item__delete--btn"><i class="fas fa-minus-circle"></i></button>
                            </div>
                        </div>
                    </div>`;
            }
            document.querySelector(element).insertAdjacentHTML("beforeend", html);

            // replace the placeholder text with some actual data
            // insert the html into the DOM
        },

        deleteListItem: function(selectorID) {
            let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            let fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            fields[0].focus();
        },

        displayBudget: function(obj) {
            let type = obj.budget > 0 ? "inc" : "exp";
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp");
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "--";
            }
        },

        displayPercentages: function(percentages) {
            let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = "--";
                }
            });
        },

        displayMonth: function() {
            let now = new Date();
            let year = now.getFullYear();

            let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            let month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ", " + year;
        },

        changedType: function() {
            let fields = document.querySelectorAll(
                DOMstrings.inputType + ", " + 
                DOMstrings.inputDescription + ", " + 
                DOMstrings.inputValue
            );

            nodeListForEach(fields, function(current) {
                current.classList.toggle("red-focus");
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
        }
    };

})();


let controller = (function (budgetCtrl, UICtrl) {

    let setupEventListeners = function () {
        let DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
        document.addEventListener("keypress", function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
    };

    let updateBudget = function() {
        // calculate the budget
        budgetCtrl.calculateBudget();

        // return the budget
        let budget = budgetCtrl.getBudget();

        // display the budget
        UICtrl.displayBudget(budget);
    };

    let updatePercentages = function() {

        // calculate percentages
        budgetCtrl.calculatePercentages();

        // read percentages from the budget controller
        let percentages = budgetCtrl.getPercentages();

        // update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    }

    let ctrlAddItem = function () {
        // get the filled input data
        let input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // add the item to the budget controller
            let newItem = budgetCtrl.addItem(input.type, input.description, input.value)
    
            // add the item to the UI
            UICtrl.addListItem(newItem, input.type);
    
            // clear the fileds
            UICtrl.clearFields();
    
            // calculate and update budget
            updateBudget();

            // calculate and update percentages
            updatePercentages();
        }
    };

    let ctrlDeleteItem = function(event) {
        let itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.id || event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            splitID = itemID.split("-");
            type = splitID[0];
            ID = Number(splitID[1]);

            // delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // update and show the new budget
            updateBudget();

            // calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function () {
            console.log("Application has started.");
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);



controller.init();

