describe('Explore page', () => {
  it('navigates to the categories page', () => {
    cy.visit('/explore')
    cy.get('a[href^="/explore/categories"]').click()
    cy.get('button > svg[data-icon="angle-left"]').parent().click()
  })
})
