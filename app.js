//  BUDGET CONTROLLER
var budgetController = (function() {
  const Expense = function(id, desc, value) {
    this.id = id;
    this.desc = desc;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  const Income = function(id, desc, value) {
    this.id = id;
    this.desc = desc;
    this.value = value;
  };

  let calculateTotal = function(type) {
    let sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
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

  return {
    addItem: function(type, des, val) {
      let newItem, ID;

      //create ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //create new item based on 'inc' or 'exp' type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      //push it in to our data structure
      data.allItems[type].push(newItem);

      //return the new element
      return newItem;
    },
    deleteItem: function(type, id) {
      let ids, index;

      ids = data.allItems[type].map(function(cur) {
        return cur.id;
      });
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: function() {
      //calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");

      //caculate the budget income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      //calculate to percentage of income we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    calculatePercentages: function() {
      //
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: function() {
      let allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
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
    testing: function() {
      console.log(data);
    }
  };
})();

//  UI CONTROLLER
let UIController = (function() {
  const DOMstrings = {
    inputType: ".add__type",
    inputDesc: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    itemPercentage: ".item__percentage",
    dateLabel: ".budget__title--month"
  };
  const formatNumber = function(num, type) {
    let numSplit, int, dec;
    num = Math.abs(num);
    num = num.toFixed(2); // add/round two decimal places after each number

    numSplit = num.split(".");

    int = numSplit[0];
    dec = numSplit[1];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  return {
    //gets inputs for creating an item object
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // inc or exp
        desc: document.querySelector(DOMstrings.inputDesc).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    getDOMstrings: function() {
      return DOMstrings;
    },

    addListItem: function(obj, type) {
      var html, newHtml, element;
      // 1. create html string with placeholder text

      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%desc%</div> <div class="right clearfix"><div class="item__value">%value%</div> <div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';
      }

      // 2. replace the text with actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%desc%", obj.desc);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      // 3. instert into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    deleteListItem: function(selectorId) {
      let element = document.getElementById(selectorId);
      element.parentNode.removeChild(element);
    },
    // 4. clear the input fields
    clearFields: function() {
      let fields, fieldsArray;

      fields = document.querySelectorAll(
        DOMstrings.inputDesc + ", " + DOMstrings.inputValue
      );

      fieldsArray = Array.prototype.slice.call(fields);

      fieldsArray.forEach(function(curr, i, arr) {
        curr.value = "";
      });

      fieldsArray[0].focus();
    },
    displayBudget: function(obj) {
      let type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMstrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },
    displayPercentages: function(percentages) {
      let fields = document.querySelectorAll(DOMstrings.itemPercentage);

      const nodeListForEach = function(list, callback) {
        for (let i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };

      nodeListForEach(fields, function(curr, index) {
        if (percentages[index] > 0) {
          curr.textContent = percentages[index] + "%";
        } else {
          curr.textContent = "---";
        }
      });
    },
    displayMonth: function() {
      let now, year, month, months;
      months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ];
      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + ", " + year;
    }
  };
})();

//  GLOBAL APP CONTROLLER
let controller = (function(budgetCtrl, UICtrl) {
  // attatch all event listeners
  let setupEventListeners = function() {
    const DOM = UICtrl.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener("click", function() {
      ctrlAddItem();
    });

    document.addEventListener("keypress", function(e) {
      if (e.keyCode === 13 || e.which === 13) {
        ctrlAddItem();
      }
    });
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
  };

  let updatePercentages = function() {
    // 1. calc percentages
    budgetCtrl.calculatePercentages();
    // 2. read percentages from budget controller
    let percentages = budgetCtrl.getPercentages();
    // 3. update the UI
    UICtrl.displayPercentages(percentages);
  };

  let updateBudget = function() {
    let budget;
    // 1. calc the budget
    budgetCtrl.calculateBudget();
    // 2. return the budget
    budget = budgetCtrl.getBudget();
    // 3. display the budget on UI
    UICtrl.displayBudget(budget);
  };

  let ctrlAddItem = function() {
    let input, newItem;

    // 1. get input data
    input = UICtrl.getInput();
    if (input.desc !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. add item to the budget controller
      newItem = budgetController.addItem(input.type, input.desc, input.value);

      // 3. add the item to UI
      UICtrl.addListItem(newItem, input.type);

      // 4. Clear the fields
      UICtrl.clearFields();

      // 5. calculate and update budget
      updateBudget();

      // 6. calculate and update percentages
      updatePercentages();
    }
  };

  const ctrlDeleteItem = function(e) {
    let itemId, splitId, type, ID;

    itemId = e.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemId) {
      splitId = itemId.split("-");
      type = splitId[0];
      ID = parseInt(splitId[1]);

      // 1. delete item from data
      budgetCtrl.deleteItem(type, ID);

      // 2. delte item from UI
      UICtrl.deleteListItem(itemId);

      // 3. update and show budget
      updateBudget();

      // . update and show percentages
      updatePercentages();
    }
  };

  return {
    init: function() {
      let budget = {
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      };
      setupEventListeners();
      UICtrl.displayBudget(budget);
      UICtrl.displayMonth();
    }
  };
})(budgetController, UIController);

controller.init();
