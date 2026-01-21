"""
* Every company has a shareholding structure (a.k.a. beneficial owners).
* Beneficial owner can be either a individual person or another company.
* Beneficial owner is characterized by % percentage in ownership.
* Shareholding structures can be multi-layered (see examples below)
* Ownership is transitive, so if person X owns 100% of company A which 
  owns 100% of company B, then, effectively, person X owns 100% of company B
* Your goal is to write code that finds all ultimate (direct & indirect) 
  individual beneficial owners of a company & calculates their percentages of ownership.

---------------------------------------
Example 1:
- Input (beneficial owners):
           C
        /      \
     I1(40%)  I2(60%)

- Output (ultimate beneficial owners): 
  I1 (40%), I2 (60%)
---------------------------------------
Example 2:
- Input (beneficial owners):
           C
        /      \
     C1(50%)  I1(50%)
     /    \
 I2(50%)  I3(50%)

- Output (ultimate beneficial owners): 
  I1 (50%), I2 (25%), I3 (25%)
---------------------------------------
Example 3:
- Input (beneficial owners):
               C
            /      \
        C1(50%)  I1(50%)
        /    \
    C2(40%)  I1(60%)
    /     \
I2(10%) I3(90%)

- Output (ultimate beneficial owners):
  I1 (80%), I2 (2%), I3 (18%)
---------------------------------------
"""


# Direct beneficial owner (aka shareholder) of a company.
# In case of corporate owner, "registration_number" field contains company identifier.
# In case of individual owner, "registration_number" is None.
# Ownership is a float [0, 1]
BeneficialOwner = tuple[str, str | None, float]  # (name, registration_number, ownership)


# Ultimate beneficial owner of a company. Always an individual.
# Ownership is a float [0, 1]
UltimateBeneficialOwner = tuple[str, float]      # (name, ownership)


class BusinessRegisterClient:
  """
  A client that contains business register integration implementation.
  It has a method "get_beneficial_owners()" that returns a list of direct owners
  of a given company based on its registration number.
  """
  def get_beneficial_owners(self, registration_number: str) -> list[BeneficialOwner]:
    # 3rd party API call
    # ASSUME IT'S ALREADY IMPLEMENTED
    ...
"""
Example 3:
- Input (beneficial owners):
               C
            /      \
        C1(50%)  I1(50%)
        /    \
    C2(40%)  I1(60%)
    /     \
I2(10%) I3(90%)

- Output (ultimate beneficial owners):
  I1 (80%), I2 (2%), I3 (18%)
---------------------------------------
"""
class UBOCalculator:
  """
  A class that finds a set of ultimate beneficial owners of a given company.
  """
  def __init__(self, br_client: BusinessRegisterClient):
    self.br_client = br_client

  def get_ultimate_beneficial_owners(self, registration_number: str) -> set[UltimateBeneficialOwner]:
    # YOUR CODE GOES HERE
    self.response = {}
    #I1 - 50%, sum -> I1 - 30%
    
    def dfs(node: BeneficialOwner, accumulator: float):
      ## if registration is empty => is an individual
      if not node[1]:
        #% of participation
        if node[0] in self.response:
          self.response[node[0]] += accumulator*node[2]
          return
        self.response[node[0]] = accumulator*node[2]
        return
    	nextNodes = get_benefitial_owner(registration_number[1])
      for nextnode in nextnodes:
      	dfs(nextNode, accumulator*nextNode[2])
    
    dfs(("", registration_number, 1),1)
    return set(self.response.items())
    
    
    
    
    
    