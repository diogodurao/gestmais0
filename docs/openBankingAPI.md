# priority rule variation: (yet to decide)
1. the normal quotas are always paid first, and only then the extra quotas are paid (1 by 1) skewed.
2. the normal quotas are always paid first, until the resident dont ahve any remaining payment for the normal quota, and only then the extra quotas are paid.
3. if it is not a fixed identifiable amount —> it can be assumed in the program as credit for the manager to defer what was paid by the resident.


# other probabilities: 
- for residents who don't use the app and still pay through the bank, the program follows the priority rule (still to decide) - the manager will need to manually insert the IBAN of each resident who don't use the app - for the automation work correctly, every fraction in the application should have an IBAN associated with it (except those the manager knows they will pay in cash).

- for those who pay in cash, the manager has to select manually. - the manual selection logic and option should always be available in the application.


# Variables:
- If the quota is fixed for everyone —> transfer made from a specific IBAN (associated with resident/fraction) —> match fixed quota value —> automatically marks the quota as paid.

- If the quota is based on a permillage for everyone —> the API will look at that specific value for each fraction as absolute —> receives transfer of the exact quota amount for the specific fraction —> automatically marks as paid.

- If the resident pays the fixed amount defined for 1 month's payment (whether normal or extra quota), the program automatically assumes it.

- If the transaction is a different amount, the program will give priority to the monthly fee first, before adding status to the extra fee. 
--> hypothetical example and variables: 
    - monthly quota is €25 —> user pays €50 —> assumes 2 monthly quota payments.
    - monthly quota is €25 —> user pays €35 —> assumes 1 quota paid + 1 monthly quota partially paid.
    - monthly quota is €25 + extra quota is €34.45 —> user pays €34.45 —> assumes 1 extra quota paid.
    - monthly quota is €25 + extra quota is €34.45 —> user pays €60 —> assumes the outstanding monthly quotas first —> whatever remains/if anything remains —> assumes extra quota.


## Problems and solutions: 
# Problem: Duplicate transaction detection:
    - solution: store transaction ID

# Problem: transaction description fetching:
    - Ignore transfer description, because it involves + complexity and low return.

# Problem: Timing association issues:
    - multiple transactions on same day from same resident.
    - transaction date vs due date defined in the building_ID.
(the building needs to have set up the date to pay and the last date to pay before the payment is late)


# Problem: What if IBANs don't match:
    - Allow multiple IBANs per resident (this is related to the resident account settings and data)
    - Unmatched payment from new IBAN —> alert manager

# problem: Irregular payments:
1. Calculate total owned by resident (from all quota typs in the building_ID)
2. If payment = total = mark all paid
3. If payment = oldest pending = allocate
4. If partial = create allocation —> flag for revision

# Problem: Advanced payments:
- Credit balance system:
    - if thee resident has all payments done, and does a transfer --> this means the resident is paying in advance; in the manager dashboard, the manager can assign what was paid in advance, or (if the resident in question have a account on the platform) the resident will see in his resident dashboard some sort of "credit balance" to assign about his quotas.

- the solution for the problem "advnaced payments" can also be something to consider related to easier identification and allocation of payments; appearing in the resident dashboard as "credit/pending balance", and the resident select what was paid.
