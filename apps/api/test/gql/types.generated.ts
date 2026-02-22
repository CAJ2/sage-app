export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with RFC 3339. */
  DateTime: { input: any; output: any; }
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: { input: any; output: any; }
};

export enum CacheControlScope {
  Private = 'PRIVATE',
  Public = 'PUBLIC'
}

export type CategoriesPage = {
  __typename?: 'CategoriesPage';
  edges?: Maybe<Array<CategoryEdge>>;
  nodes?: Maybe<Array<Category>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** A hierarchical category for classifying product items */
export type Category = Named & {
  __typename?: 'Category';
  /** All ancestor categories up the hierarchy tree */
  ancestors: CategoriesPage;
  /** Direct child categories in the hierarchy */
  children: CategoriesPage;
  createdAt: Scalars['DateTime']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  /** A short summary description */
  descShort?: Maybe<Scalars['String']['output']>;
  /** Translated versions of the short description */
  descShortTr?: Maybe<Array<TranslatedOutput>>;
  /** Translated versions of the description */
  descTr?: Maybe<Array<TranslatedOutput>>;
  /** All descendant categories down the hierarchy tree */
  descendants: CategoriesPage;
  /** Audit history of changes to this category */
  history: Array<CategoryHistory>;
  id: Scalars['ID']['output'];
  imageURL?: Maybe<Scalars['String']['output']>;
  /** Items classified under this category */
  items: ItemsPage;
  name: Scalars['String']['output'];
  /** Translated versions of the name */
  nameTr?: Maybe<Array<TranslatedOutput>>;
  /** Direct parent categories in the hierarchy */
  parents: CategoriesPage;
  updatedAt: Scalars['DateTime']['output'];
};


/** A hierarchical category for classifying product items */
export type CategoryAncestorsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A hierarchical category for classifying product items */
export type CategoryChildrenArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A hierarchical category for classifying product items */
export type CategoryDescendantsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A hierarchical category for classifying product items */
export type CategoryItemsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A hierarchical category for classifying product items */
export type CategoryParentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type CategoryEdge = {
  __typename?: 'CategoryEdge';
  cursor: Scalars['String']['output'];
  node: Category;
};

export type CategoryHistory = {
  __typename?: 'CategoryHistory';
  category_id: Scalars['String']['output'];
  changes?: Maybe<Scalars['JSONObject']['output']>;
  datetime: Scalars['DateTime']['output'];
  original?: Maybe<Scalars['JSONObject']['output']>;
  user: User;
};

/** A proposed or merged set of edits to one or more data models */
export type Change = {
  __typename?: 'Change';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  /** The individual entity edits included in this change */
  edits: ChangeEditsPage;
  id: Scalars['ID']['output'];
  /** Source references supporting this change */
  sources: SourcesPage;
  status: ChangeStatus;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  /** The user who created this change */
  user: User;
};


/** A proposed or merged set of edits to one or more data models */
export type ChangeEditsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<EditModelType>;
};


/** A proposed or merged set of edits to one or more data models */
export type ChangeSourcesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type ChangeEdge = {
  __typename?: 'ChangeEdge';
  cursor: Scalars['String']['output'];
  node: Change;
};

export type ChangeEditsPage = {
  __typename?: 'ChangeEditsPage';
  edges?: Maybe<Array<EditEdge>>;
  nodes?: Maybe<Array<Edit>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Status of a change */
export enum ChangeStatus {
  Approved = 'APPROVED',
  Draft = 'DRAFT',
  Merged = 'MERGED',
  Proposed = 'PROPOSED',
  Rejected = 'REJECTED'
}

export type ChangesPage = {
  __typename?: 'ChangesPage';
  edges?: Maybe<Array<ChangeEdge>>;
  nodes?: Maybe<Array<Change>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** A physical component of a product variant, made of one or more materials */
export type Component = Named & {
  __typename?: 'Component';
  createdAt: Scalars['DateTime']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  /** Audit history of changes to this component */
  history: Array<ComponentHistory>;
  /** The ID of the model */
  id: Scalars['ID']['output'];
  imageURL?: Maybe<Scalars['String']['output']>;
  /** All materials in this component with their fractions */
  materials: Array<ComponentMaterial>;
  name?: Maybe<Scalars['String']['output']>;
  /** The primary material this component is made of */
  primaryMaterial: Material;
  /** Available recycling options for this component by stream */
  recycle?: Maybe<Array<ComponentRecycle>>;
  /** Aggregated recyclability score for this component */
  recycleScore?: Maybe<StreamScore>;
  /** The geographic region this component's recycling data applies to */
  region?: Maybe<Region>;
  tags: Array<Tag>;
  updatedAt: Scalars['DateTime']['output'];
};


/** A physical component of a product variant, made of one or more materials */
export type ComponentRecycleArgs = {
  regionID?: InputMaybe<Scalars['ID']['input']>;
};


/** A physical component of a product variant, made of one or more materials */
export type ComponentRecycleScoreArgs = {
  regionID?: InputMaybe<Scalars['ID']['input']>;
};

export type ComponentEdge = {
  __typename?: 'ComponentEdge';
  cursor: Scalars['String']['output'];
  node: Component;
};

export type ComponentHistory = {
  __typename?: 'ComponentHistory';
  changes?: Maybe<Scalars['JSONObject']['output']>;
  componentID: Scalars['String']['output'];
  datetime: Scalars['DateTime']['output'];
  original?: Maybe<Scalars['JSONObject']['output']>;
  user: User;
};

/** The fraction of a specific material within a component */
export type ComponentMaterial = {
  __typename?: 'ComponentMaterial';
  material: Material;
  /** Fraction of this material in the component (0–1) */
  materialFraction?: Maybe<Scalars['Float']['output']>;
};

export type ComponentMaterialInput = {
  id: Scalars['ID']['input'];
  /** Fraction of this material in the component (0–1) */
  materialFraction?: InputMaybe<Scalars['Float']['input']>;
};

/** A recycling option for a component in a specific recycling stream */
export type ComponentRecycle = {
  __typename?: 'ComponentRecycle';
  context?: Maybe<StreamContext>;
  stream?: Maybe<RecyclingStream>;
};

export type ComponentRegionInput = {
  id: Scalars['ID']['input'];
};

export type ComponentTagsInput = {
  id: Scalars['ID']['input'];
  meta?: InputMaybe<Scalars['JSONObject']['input']>;
};

export type ComponentsPage = {
  __typename?: 'ComponentsPage';
  edges?: Maybe<Array<ComponentEdge>>;
  nodes?: Maybe<Array<Component>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** A collection container for a recycling stream (e.g. a bin or bag) */
export type Container = {
  __typename?: 'Container';
  /** Access method for the container (e.g. CURBSIDE, DROP_OFF) */
  access?: Maybe<Scalars['String']['output']>;
  /** Typical color of the container */
  color?: Maybe<Scalars['String']['output']>;
  /** URL of an image of the container */
  image?: Maybe<Scalars['String']['output']>;
  /** Coordinates for the item entry point on the container image */
  imageEntryPoint?: Maybe<ContainerImageEntryPoint>;
  /** Physical dimensions of the container */
  shape?: Maybe<ContainerShape>;
  /** Container type (e.g. BIN, BAG, BOX) */
  type: Scalars['String']['output'];
};

export type ContainerImageEntryPoint = {
  __typename?: 'ContainerImageEntryPoint';
  side: Scalars['String']['output'];
  x: Scalars['Float']['output'];
  y: Scalars['Float']['output'];
};

export type ContainerShape = {
  __typename?: 'ContainerShape';
  depth?: Maybe<Scalars['Float']['output']>;
  height?: Maybe<Scalars['Float']['output']>;
  width?: Maybe<Scalars['Float']['output']>;
};

export type CreateCategoryInput = {
  /** Sources to associate with this change */
  addSources?: InputMaybe<Array<SourceInput>>;
  /** If true, immediately apply (merge) the change after creation */
  apply?: InputMaybe<Scalars['Boolean']['input']>;
  /** Details for a new change to create for this edit */
  change?: InputMaybe<CreateChangeInput>;
  /** ID of an existing change to add this edit to */
  changeID?: InputMaybe<Scalars['ID']['input']>;
  desc?: InputMaybe<Scalars['String']['input']>;
  descShort?: InputMaybe<Scalars['String']['input']>;
  descShortTr?: InputMaybe<Array<TranslatedInput>>;
  descTr?: InputMaybe<Array<TranslatedInput>>;
  imageURL?: InputMaybe<Scalars['String']['input']>;
  /** Language code for text input fields (BCP 47, e.g. "en") */
  lang?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  nameTr?: InputMaybe<Array<TranslatedInput>>;
  /** IDs of sources to remove from this change */
  removeSources?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type CreateCategoryOutput = {
  __typename?: 'CreateCategoryOutput';
  category?: Maybe<Category>;
  change?: Maybe<Change>;
};

export type CreateChangeInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  sources?: InputMaybe<Array<Scalars['ID']['input']>>;
  status?: InputMaybe<ChangeStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type CreateChangeOutput = {
  __typename?: 'CreateChangeOutput';
  change?: Maybe<Change>;
};

export type CreateComponentInput = {
  /** Sources to associate with this change */
  addSources?: InputMaybe<Array<SourceInput>>;
  /** If true, immediately apply (merge) the change after creation */
  apply?: InputMaybe<Scalars['Boolean']['input']>;
  /** Details for a new change to create for this edit */
  change?: InputMaybe<CreateChangeInput>;
  /** ID of an existing change to add this edit to */
  changeID?: InputMaybe<Scalars['ID']['input']>;
  desc?: InputMaybe<Scalars['String']['input']>;
  descTr?: InputMaybe<Array<TranslatedInput>>;
  imageURL?: InputMaybe<Scalars['String']['input']>;
  /** Language code for text input fields (BCP 47, e.g. "en") */
  lang?: InputMaybe<Scalars['String']['input']>;
  materials?: InputMaybe<Array<ComponentMaterialInput>>;
  name?: InputMaybe<Scalars['String']['input']>;
  nameTr?: InputMaybe<Array<TranslatedInput>>;
  physical?: InputMaybe<Scalars['JSONObject']['input']>;
  primaryMaterial?: InputMaybe<ComponentMaterialInput>;
  region?: InputMaybe<ComponentRegionInput>;
  /** IDs of sources to remove from this change */
  removeSources?: InputMaybe<Array<Scalars['ID']['input']>>;
  tags?: InputMaybe<Array<ComponentTagsInput>>;
  visual?: InputMaybe<Scalars['JSONObject']['input']>;
};

export type CreateComponentOutput = {
  __typename?: 'CreateComponentOutput';
  change?: Maybe<Change>;
  component?: Maybe<Component>;
};

export type CreateItemInput = {
  /** Sources to associate with this change */
  addSources?: InputMaybe<Array<SourceInput>>;
  /** If true, immediately apply (merge) the change after creation */
  apply?: InputMaybe<Scalars['Boolean']['input']>;
  categories?: InputMaybe<Array<ItemCategoriesInput>>;
  /** Details for a new change to create for this edit */
  change?: InputMaybe<CreateChangeInput>;
  /** ID of an existing change to add this edit to */
  changeID?: InputMaybe<Scalars['ID']['input']>;
  desc?: InputMaybe<Scalars['String']['input']>;
  descTr?: InputMaybe<Array<TranslatedInput>>;
  imageURL?: InputMaybe<Scalars['String']['input']>;
  /** Language code for text input fields (BCP 47, e.g. "en") */
  lang?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  nameTr?: InputMaybe<Array<TranslatedInput>>;
  /** IDs of sources to remove from this change */
  removeSources?: InputMaybe<Array<Scalars['ID']['input']>>;
  tags?: InputMaybe<Array<ItemTagsInput>>;
};

export type CreateItemOutput = {
  __typename?: 'CreateItemOutput';
  change?: Maybe<Change>;
  item?: Maybe<Item>;
};

export type CreateOrgInput = {
  /** Sources to associate with this change */
  addSources?: InputMaybe<Array<SourceInput>>;
  /** If true, immediately apply (merge) the change after creation */
  apply?: InputMaybe<Scalars['Boolean']['input']>;
  avatarURL?: InputMaybe<Scalars['String']['input']>;
  /** Details for a new change to create for this edit */
  change?: InputMaybe<CreateChangeInput>;
  /** ID of an existing change to add this edit to */
  changeID?: InputMaybe<Scalars['ID']['input']>;
  desc?: InputMaybe<Scalars['String']['input']>;
  /** Language code for text input fields (BCP 47, e.g. "en") */
  lang?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  /** IDs of sources to remove from this change */
  removeSources?: InputMaybe<Array<Scalars['ID']['input']>>;
  slug: Scalars['String']['input'];
  websiteURL?: InputMaybe<Scalars['String']['input']>;
};

export type CreateOrgOutput = {
  __typename?: 'CreateOrgOutput';
  change?: Maybe<Change>;
  org?: Maybe<Org>;
};

export type CreateProcessInput = {
  /** Sources to associate with this change */
  addSources?: InputMaybe<Array<SourceInput>>;
  /** If true, immediately apply (merge) the change after creation */
  apply?: InputMaybe<Scalars['Boolean']['input']>;
  /** Details for a new change to create for this edit */
  change?: InputMaybe<CreateChangeInput>;
  /** ID of an existing change to add this edit to */
  changeID?: InputMaybe<Scalars['ID']['input']>;
  desc?: InputMaybe<Scalars['String']['input']>;
  descTr?: InputMaybe<Array<TranslatedInput>>;
  efficiency?: InputMaybe<Scalars['JSONObject']['input']>;
  instructions?: InputMaybe<Scalars['JSONObject']['input']>;
  intent: Scalars['String']['input'];
  /** Language code for text input fields (BCP 47, e.g. "en") */
  lang?: InputMaybe<Scalars['String']['input']>;
  material?: InputMaybe<ProcessMaterialInput>;
  name?: InputMaybe<Scalars['String']['input']>;
  nameTr?: InputMaybe<Array<TranslatedInput>>;
  org?: InputMaybe<ProcessOrgInput>;
  place?: InputMaybe<ProcessPlaceInput>;
  region?: InputMaybe<ProcessRegionInput>;
  /** IDs of sources to remove from this change */
  removeSources?: InputMaybe<Array<Scalars['ID']['input']>>;
  rules?: InputMaybe<Scalars['JSONObject']['input']>;
  variant?: InputMaybe<ProcessVariantInput>;
};

export type CreateProcessOutput = {
  __typename?: 'CreateProcessOutput';
  change?: Maybe<Change>;
  process?: Maybe<Process>;
};

export type CreateSourceInput = {
  content?: InputMaybe<Scalars['JSONObject']['input']>;
  contentURL?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['JSONObject']['input']>;
  type: SourceType;
};

export type CreateSourceOutput = {
  __typename?: 'CreateSourceOutput';
  source?: Maybe<Source>;
};

export type CreateTagDefinitionInput = {
  bgColor?: InputMaybe<Scalars['String']['input']>;
  desc?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  metaTemplate?: InputMaybe<Scalars['JSONObject']['input']>;
  name: Scalars['String']['input'];
  type: TagType;
};

export type CreateTagDefinitionOutput = {
  __typename?: 'CreateTagDefinitionOutput';
  tag?: Maybe<TagDefinition>;
};

export type CreateVariantInput = {
  /** Sources to associate with this change */
  addSources?: InputMaybe<Array<SourceInput>>;
  /** If true, immediately apply (merge) the change after creation */
  apply?: InputMaybe<Scalars['Boolean']['input']>;
  /** Details for a new change to create for this edit */
  change?: InputMaybe<CreateChangeInput>;
  /** ID of an existing change to add this edit to */
  changeID?: InputMaybe<Scalars['ID']['input']>;
  /** Manufacturer or product code for this variant */
  code?: InputMaybe<Scalars['String']['input']>;
  components?: InputMaybe<Array<VariantComponentsInput>>;
  desc?: InputMaybe<Scalars['String']['input']>;
  descTr?: InputMaybe<Array<TranslatedInput>>;
  imageURL?: InputMaybe<Scalars['String']['input']>;
  items?: InputMaybe<Array<VariantItemsInput>>;
  /** Language code for text input fields (BCP 47, e.g. "en") */
  lang?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  nameTr?: InputMaybe<Array<TranslatedInput>>;
  orgs?: InputMaybe<Array<VariantOrgsInput>>;
  region?: InputMaybe<VariantRegionsInput>;
  regions?: InputMaybe<Array<VariantRegionsInput>>;
  /** IDs of sources to remove from this change */
  removeSources?: InputMaybe<Array<Scalars['ID']['input']>>;
  tags?: InputMaybe<Array<VariantTagsInput>>;
};

export type CreateVariantOutput = {
  __typename?: 'CreateVariantOutput';
  change?: Maybe<Change>;
  variant?: Maybe<Variant>;
};

export type DeleteChangeOutput = {
  __typename?: 'DeleteChangeOutput';
  success?: Maybe<Scalars['Boolean']['output']>;
};

export type DeleteInput = {
  addSources?: InputMaybe<Array<SourceInput>>;
  apply?: InputMaybe<Scalars['Boolean']['input']>;
  change?: InputMaybe<CreateChangeInput>;
  changeID?: InputMaybe<Scalars['ID']['input']>;
  id: Scalars['ID']['input'];
  removeSources?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type DeleteOutput = {
  __typename?: 'DeleteOutput';
  id?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type DeleteSourceOutput = {
  __typename?: 'DeleteSourceOutput';
  success?: Maybe<Scalars['Boolean']['output']>;
};

export type DirectEdit = {
  __typename?: 'DirectEdit';
  createModel?: Maybe<Scalars['JSONObject']['output']>;
  entityName: Scalars['String']['output'];
  id?: Maybe<Scalars['ID']['output']>;
  updateModel?: Maybe<Scalars['JSONObject']['output']>;
};

export type DiscardEditOutput = {
  __typename?: 'DiscardEditOutput';
  id?: Maybe<Scalars['ID']['output']>;
  success?: Maybe<Scalars['Boolean']['output']>;
};

/** A tracked edit to a single entity within a change */
export type Edit = {
  __typename?: 'Edit';
  /** The proposed state of the entity after this edit */
  changes?: Maybe<EditModel>;
  /** Raw field values for creating a new entity */
  createChanges?: Maybe<Scalars['JSONObject']['output']>;
  /** The type name of the entity being edited (e.g. Item, Component) */
  entityName: Scalars['String']['output'];
  id?: Maybe<Scalars['ID']['output']>;
  /** The state of the entity before this edit */
  original?: Maybe<EditModel>;
  /** Raw field values for updating an existing entity */
  updateChanges?: Maybe<Scalars['JSONObject']['output']>;
};

export type EditEdge = {
  __typename?: 'EditEdge';
  cursor: Scalars['String']['output'];
  node: Edit;
};

export type EditModel = Category | Component | Item | Material | Place | Process | Region | Variant;

/** Type of the model being edited */
export enum EditModelType {
  Category = 'Category',
  Component = 'Component',
  Item = 'Item',
  Material = 'Material',
  Place = 'Place',
  Process = 'Process',
  Region = 'Region',
  Variant = 'Variant'
}

/** A product or consumable item that can be categorized and have multiple variants */
export type Item = Named & {
  __typename?: 'Item';
  /** Categories this item belongs to */
  categories: CategoriesPage;
  createdAt: Scalars['DateTime']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  /** Audit history of changes to this item */
  history: Array<ItemHistory>;
  /** The ID of the model */
  id: Scalars['ID']['output'];
  imageURL?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  /** Metadata tags applied to this item */
  tags: TagPage;
  updatedAt: Scalars['DateTime']['output'];
  /** Product variants of this item (e.g. specific SKUs or models) */
  variants: VariantsPage;
};


/** A product or consumable item that can be categorized and have multiple variants */
export type ItemCategoriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A product or consumable item that can be categorized and have multiple variants */
export type ItemTagsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A product or consumable item that can be categorized and have multiple variants */
export type ItemVariantsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type ItemCategoriesInput = {
  id: Scalars['ID']['input'];
};

export type ItemEdge = {
  __typename?: 'ItemEdge';
  cursor: Scalars['String']['output'];
  node: Item;
};

export type ItemHistory = {
  __typename?: 'ItemHistory';
  changes?: Maybe<Scalars['JSONObject']['output']>;
  datetime: Scalars['DateTime']['output'];
  item_id: Scalars['String']['output'];
  original?: Maybe<Scalars['JSONObject']['output']>;
  user: User;
};

export type ItemTagsInput = {
  id: Scalars['ID']['input'];
  meta?: InputMaybe<Scalars['JSONObject']['input']>;
};

export type ItemsPage = {
  __typename?: 'ItemsPage';
  edges?: Maybe<Array<ItemEdge>>;
  nodes?: Maybe<Array<Item>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type MarkSourceProcessedOutput = {
  __typename?: 'MarkSourceProcessedOutput';
  success?: Maybe<Scalars['Boolean']['output']>;
};

/** A raw or processed material that physical components are composed of */
export type Material = Named & {
  __typename?: 'Material';
  /** All ancestor materials up the hierarchy */
  ancestors: MaterialsPage;
  /** Direct child materials in the hierarchy */
  children: MaterialsPage;
  /** All components that include this material */
  components: ComponentsPage;
  createdAt: Scalars['DateTime']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  /** All descendant materials down the hierarchy */
  descendants: MaterialsPage;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  /** Direct parent materials in the hierarchy */
  parents: MaterialsPage;
  /** Components that primarily use this material */
  primaryComponents: ComponentsPage;
  /** Recycling or disposal processes for this material */
  processes: ProcessPage;
  /** The physical form or shape of the material (e.g. film, rigid, fibre) */
  shape?: Maybe<Scalars['String']['output']>;
  /** If true, this is an internal technical classification not shown to end-users */
  technical: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTime']['output'];
};


/** A raw or processed material that physical components are composed of */
export type MaterialAncestorsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A raw or processed material that physical components are composed of */
export type MaterialChildrenArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A raw or processed material that physical components are composed of */
export type MaterialComponentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A raw or processed material that physical components are composed of */
export type MaterialDescendantsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A raw or processed material that physical components are composed of */
export type MaterialParentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A raw or processed material that physical components are composed of */
export type MaterialPrimaryComponentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A raw or processed material that physical components are composed of */
export type MaterialProcessesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type MaterialEdge = {
  __typename?: 'MaterialEdge';
  cursor: Scalars['String']['output'];
  node: Material;
};

export type MaterialsPage = {
  __typename?: 'MaterialsPage';
  edges?: Maybe<Array<MaterialEdge>>;
  nodes?: Maybe<Array<Material>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type MergeChangeOutput = {
  __typename?: 'MergeChangeOutput';
  change?: Maybe<Change>;
};

export type ModelEditSchema = {
  __typename?: 'ModelEditSchema';
  create?: Maybe<ModelSchema>;
  delete?: Maybe<ModelSchema>;
  update?: Maybe<ModelSchema>;
};

export type ModelSchema = {
  __typename?: 'ModelSchema';
  schema?: Maybe<Scalars['JSONObject']['output']>;
  uischema?: Maybe<Scalars['JSONObject']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createCategory?: Maybe<CreateCategoryOutput>;
  createChange?: Maybe<CreateChangeOutput>;
  createComponent?: Maybe<CreateComponentOutput>;
  createItem?: Maybe<CreateItemOutput>;
  createOrg?: Maybe<CreateOrgOutput>;
  createProcess?: Maybe<CreateProcessOutput>;
  createSource?: Maybe<CreateSourceOutput>;
  createTagDefinition?: Maybe<CreateTagDefinitionOutput>;
  createVariant?: Maybe<CreateVariantOutput>;
  deleteCategory?: Maybe<DeleteOutput>;
  deleteChange?: Maybe<DeleteChangeOutput>;
  deleteComponent?: Maybe<DeleteOutput>;
  deleteItem?: Maybe<DeleteOutput>;
  deleteProcess?: Maybe<DeleteOutput>;
  deleteSource?: Maybe<DeleteSourceOutput>;
  deleteVariant?: Maybe<DeleteOutput>;
  discardEdit?: Maybe<DiscardEditOutput>;
  markSourceProcessed?: Maybe<MarkSourceProcessedOutput>;
  mergeChange?: Maybe<MergeChangeOutput>;
  updateCategory?: Maybe<UpdateCategoryOutput>;
  updateChange?: Maybe<UpdateChangeOutput>;
  updateComponent?: Maybe<UpdateComponentOutput>;
  updateItem?: Maybe<UpdateItemOutput>;
  updateOrg?: Maybe<UpdateOrgOutput>;
  updateProcess?: Maybe<UpdateProcessOutput>;
  updateSource?: Maybe<UpdateSourceOutput>;
  updateTagDefinition?: Maybe<UpdateTagDefinitionOutput>;
  updateVariant?: Maybe<UpdateVariantOutput>;
};


export type MutationCreateCategoryArgs = {
  input: CreateCategoryInput;
};


export type MutationCreateChangeArgs = {
  input: CreateChangeInput;
};


export type MutationCreateComponentArgs = {
  input: CreateComponentInput;
};


export type MutationCreateItemArgs = {
  input: CreateItemInput;
};


export type MutationCreateOrgArgs = {
  input: CreateOrgInput;
};


export type MutationCreateProcessArgs = {
  input: CreateProcessInput;
};


export type MutationCreateSourceArgs = {
  input: CreateSourceInput;
};


export type MutationCreateTagDefinitionArgs = {
  input: CreateTagDefinitionInput;
};


export type MutationCreateVariantArgs = {
  input: CreateVariantInput;
};


export type MutationDeleteCategoryArgs = {
  input: DeleteInput;
};


export type MutationDeleteChangeArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteComponentArgs = {
  input: DeleteInput;
};


export type MutationDeleteItemArgs = {
  input: DeleteInput;
};


export type MutationDeleteProcessArgs = {
  input: DeleteInput;
};


export type MutationDeleteSourceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteVariantArgs = {
  input: DeleteInput;
};


export type MutationDiscardEditArgs = {
  changeID: Scalars['ID']['input'];
  editID: Scalars['ID']['input'];
};


export type MutationMarkSourceProcessedArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMergeChangeArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateCategoryArgs = {
  input: UpdateCategoryInput;
};


export type MutationUpdateChangeArgs = {
  input: UpdateChangeInput;
};


export type MutationUpdateComponentArgs = {
  input: UpdateComponentInput;
};


export type MutationUpdateItemArgs = {
  input: UpdateItemInput;
};


export type MutationUpdateOrgArgs = {
  input: UpdateOrgInput;
};


export type MutationUpdateProcessArgs = {
  input: UpdateProcessInput;
};


export type MutationUpdateSourceArgs = {
  input: UpdateSourceInput;
};


export type MutationUpdateTagDefinitionArgs = {
  input: UpdateTagDefinitionInput;
};


export type MutationUpdateVariantArgs = {
  input: UpdateVariantInput;
};

export type Named = {
  /** The description of the model */
  desc?: Maybe<Scalars['String']['output']>;
  /** The ID of the model */
  id: Scalars['ID']['output'];
  /** The name of the model */
  name?: Maybe<Scalars['String']['output']>;
};

/** An organization or company on the platform */
export type Org = Named & {
  __typename?: 'Org';
  avatarURL?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  history: Array<OrgHistory>;
  /** The ID of the model */
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  /** URL-friendly unique identifier for this organization */
  slug: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  /** Users that are members of this organization */
  users: UserPage;
  /** URL of the organization's website */
  websiteURL?: Maybe<Scalars['String']['output']>;
};


/** An organization or company on the platform */
export type OrgUsersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type OrgEdge = {
  __typename?: 'OrgEdge';
  cursor: Scalars['String']['output'];
  node: Org;
};

export type OrgHistory = {
  __typename?: 'OrgHistory';
  changes?: Maybe<Scalars['JSONObject']['output']>;
  datetime: Scalars['DateTime']['output'];
  org: Org;
  original?: Maybe<Scalars['JSONObject']['output']>;
  user: User;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** A specific physical location, such as a business or recycling facility */
export type Place = Named & {
  __typename?: 'Place';
  /** Structured postal address of this place */
  address?: Maybe<PlaceAddress>;
  createdAt: Scalars['DateTime']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** Geographic coordinates of this place */
  location?: Maybe<PlaceLocation>;
  name?: Maybe<Scalars['String']['output']>;
  /** The organization associated with this place */
  org?: Maybe<Org>;
  /** Metadata tags applied to this place */
  tags: TagPage;
  updatedAt: Scalars['DateTime']['output'];
};

/** A structured postal address */
export type PlaceAddress = {
  __typename?: 'PlaceAddress';
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  housenumber?: Maybe<Scalars['String']['output']>;
  postalCode?: Maybe<Scalars['String']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  street?: Maybe<Scalars['String']['output']>;
};

export type PlaceEdge = {
  __typename?: 'PlaceEdge';
  cursor: Scalars['String']['output'];
  node: Place;
};

/** Geographic coordinates (latitude and longitude) for a place */
export type PlaceLocation = {
  __typename?: 'PlaceLocation';
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
};

export type PlacesPage = {
  __typename?: 'PlacesPage';
  edges?: Maybe<Array<PlaceEdge>>;
  nodes?: Maybe<Array<Place>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** A recycling, reuse, or disposal process for a product variant or material */
export type Process = Named & {
  __typename?: 'Process';
  createdAt: Scalars['DateTime']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  /** Efficiency metrics for this process */
  efficiency?: Maybe<ProcessEfficiency>;
  /** Audit history of changes to this process */
  history: Array<ProcessHistory>;
  /** The ID of the model */
  id: Scalars['ID']['output'];
  /** The type of circular economy process (e.g. RECYCLE, REUSE, REPAIR) */
  intent: Scalars['String']['output'];
  /** The material this process handles */
  material?: Maybe<Material>;
  name?: Maybe<Scalars['String']['output']>;
  /** The organization that offers or operates this process */
  org?: Maybe<Org>;
  /** The physical location where this process is carried out */
  place?: Maybe<Place>;
  /** The geographic region where this process is available */
  region?: Maybe<Region>;
  updatedAt: Scalars['DateTime']['output'];
  /** The product variant this process applies to */
  variant?: Maybe<Variant>;
};

export type ProcessEdge = {
  __typename?: 'ProcessEdge';
  cursor: Scalars['String']['output'];
  node: Process;
};

/** Efficiency metrics for a recycling or recovery process */
export type ProcessEfficiency = {
  __typename?: 'ProcessEfficiency';
  /** Recycling or recovery efficiency ratio (0–1) */
  efficiency?: Maybe<Scalars['Float']['output']>;
  /** Material equivalency ratio for this process */
  equivalency?: Maybe<Scalars['Float']['output']>;
  /** Value recovery ratio relative to virgin material */
  valueRatio?: Maybe<Scalars['Float']['output']>;
};

export type ProcessHistory = {
  __typename?: 'ProcessHistory';
  changes?: Maybe<Scalars['JSONObject']['output']>;
  datetime: Scalars['DateTime']['output'];
  original?: Maybe<Scalars['JSONObject']['output']>;
  process: Process;
  user: User;
};

export type ProcessMaterialInput = {
  id: Scalars['ID']['input'];
};

export type ProcessOrgInput = {
  id: Scalars['ID']['input'];
};

export type ProcessPage = {
  __typename?: 'ProcessPage';
  edges?: Maybe<Array<ProcessEdge>>;
  nodes?: Maybe<Array<Process>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ProcessPlaceInput = {
  id: Scalars['ID']['input'];
};

export type ProcessRegionInput = {
  id: Scalars['ID']['input'];
};

export type ProcessVariantInput = {
  id: Scalars['ID']['input'];
};

export type Query = {
  __typename?: 'Query';
  categories: CategoriesPage;
  category?: Maybe<Category>;
  categoryRoot: Category;
  categorySchema?: Maybe<ModelEditSchema>;
  change?: Maybe<Change>;
  changes: ChangesPage;
  component?: Maybe<Component>;
  componentSchema?: Maybe<ModelEditSchema>;
  components: ComponentsPage;
  directEdit?: Maybe<DirectEdit>;
  item?: Maybe<Item>;
  itemSchema?: Maybe<ModelEditSchema>;
  items: ItemsPage;
  material?: Maybe<Material>;
  materialRoot: Material;
  materials: MaterialsPage;
  org?: Maybe<Org>;
  place?: Maybe<Place>;
  places: PlacesPage;
  process?: Maybe<Process>;
  processSchema?: Maybe<ModelEditSchema>;
  processes: ProcessPage;
  region?: Maybe<Region>;
  regions: RegionsPage;
  search: SearchResultPage;
  searchRegionsByPoint: RegionsPage;
  source?: Maybe<Source>;
  sources: SourcesPage;
  tag?: Maybe<Tag>;
  tags: TagPage;
  user?: Maybe<User>;
  variant?: Maybe<Variant>;
  variantSchema?: Maybe<ModelEditSchema>;
  variants: VariantsPage;
};


export type QueryCategoriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryChangeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryChangesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<ChangeStatus>;
  userID?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryComponentArgs = {
  id: Scalars['ID']['input'];
  withChange?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryComponentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryDirectEditArgs = {
  entityName?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryItemArgs = {
  id: Scalars['ID']['input'];
};


export type QueryItemsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMaterialArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMaterialsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryOrgArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPlaceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPlacesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryProcessArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProcessesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  material?: InputMaybe<Scalars['String']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
};


export type QueryRegionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRegionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QuerySearchArgs = {
  latlong?: InputMaybe<Array<Scalars['Float']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
  types?: InputMaybe<Array<SearchType>>;
};


export type QuerySearchRegionsByPointArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  latlong: Array<Scalars['Float']['input']>;
};


export type QuerySourceArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySourcesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<SourceType>;
};


export type QueryTagArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTagsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryVariantArgs = {
  id: Scalars['ID']['input'];
};


export type QueryVariantsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** A recycling collection stream in a region, with score and container information */
export type RecyclingStream = {
  __typename?: 'RecyclingStream';
  /** The collection container used in this stream */
  container?: Maybe<Container>;
  desc?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  /** Aggregated recyclability score for this stream */
  score?: Maybe<StreamScore>;
  /** Per-material recyclability scores within this stream */
  scores?: Maybe<Array<StreamScore>>;
};

/** A geographic region based on the Who's On First dataset */
export type Region = {
  __typename?: 'Region';
  /** Bounding box as [minLon, minLat, maxLon, maxLat] */
  bbox?: Maybe<Array<Scalars['Float']['output']>>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** Minimum map zoom level at which this region should be displayed */
  minZoom?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  /** The type of geographic entity (e.g. country, region, locality) */
  placetype: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type RegionEdge = {
  __typename?: 'RegionEdge';
  cursor: Scalars['String']['output'];
  node: Region;
};

export type RegionsPage = {
  __typename?: 'RegionsPage';
  edges?: Maybe<Array<RegionEdge>>;
  nodes?: Maybe<Array<Region>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type SearchResultItem = Category | Component | Item | Material | Org | Place | Region | Variant;

export type SearchResultItemEdge = {
  __typename?: 'SearchResultItemEdge';
  cursor: Scalars['String']['output'];
  node: SearchResultItem;
};

export type SearchResultPage = {
  __typename?: 'SearchResultPage';
  edges?: Maybe<Array<SearchResultItemEdge>>;
  nodes?: Maybe<Array<SearchResultItem>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** The item type to search */
export enum SearchType {
  Category = 'CATEGORY',
  Component = 'COMPONENT',
  Item = 'ITEM',
  Material = 'MATERIAL',
  Org = 'ORG',
  Place = 'PLACE',
  Region = 'REGION',
  Variant = 'VARIANT'
}

/** A reference source used to support data changes, such as a URL, PDF, or image */
export type Source = {
  __typename?: 'Source';
  changes: ChangesPage;
  /** Extracted or structured content from the source */
  content?: Maybe<Scalars['JSONObject']['output']>;
  contentURL?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** Reference location or citation string (e.g. page number, URL fragment) */
  location?: Maybe<Scalars['String']['output']>;
  /** Additional metadata about the source (e.g. author, publication date) */
  metadata?: Maybe<Scalars['JSONObject']['output']>;
  /** Timestamp when this source was processed and ingested */
  processedAt?: Maybe<Scalars['DateTime']['output']>;
  type: SourceType;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export type SourceEdge = {
  __typename?: 'SourceEdge';
  cursor: Scalars['String']['output'];
  node: Source;
};

export type SourceInput = {
  id: Scalars['ID']['input'];
  meta?: InputMaybe<Scalars['JSONObject']['input']>;
};

/** Type of source data */
export enum SourceType {
  Api = 'API',
  File = 'FILE',
  Image = 'IMAGE',
  Other = 'OTHER',
  Pdf = 'PDF',
  Text = 'TEXT',
  Url = 'URL',
  Video = 'VIDEO'
}

export type SourcesPage = {
  __typename?: 'SourcesPage';
  edges?: Maybe<Array<SourceEdge>>;
  nodes?: Maybe<Array<Source>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Additional context about a recycling recommendation for a component */
export type StreamContext = {
  __typename?: 'StreamContext';
  desc?: Maybe<Scalars['String']['output']>;
  /** Identifier key for this context entry */
  key: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  /** Type of contextual information */
  type?: Maybe<Scalars['String']['output']>;
  /** Value of this context entry */
  value?: Maybe<Scalars['String']['output']>;
};

/** A recyclability score for a component or variant in a recycling stream */
export type StreamScore = {
  __typename?: 'StreamScore';
  /** Quality rating for the underlying recycling data */
  dataQuality?: Maybe<StreamScoreRating>;
  /** Formatted display label for the data quality rating */
  dataQualityF?: Maybe<Scalars['String']['output']>;
  /** Maximum possible score for this stream */
  maxScore?: Maybe<Scalars['Float']['output']>;
  /** Minimum possible score for this stream */
  minScore?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  /** Qualitative rating for this score */
  rating?: Maybe<StreamScoreRating>;
  /** Formatted display label for the rating */
  ratingF?: Maybe<Scalars['String']['output']>;
  /** Numerical recyclability score */
  score?: Maybe<Scalars['Float']['output']>;
};

/** A rating enum used to describe scores */
export enum StreamScoreRating {
  Excellent = 'EXCELLENT',
  Fair = 'FAIR',
  Good = 'GOOD',
  Poor = 'POOR',
  Unknown = 'UNKNOWN',
  VeryGood = 'VERY_GOOD'
}

/** A tag instance applied to a model, with optional instance-specific metadata */
export type Tag = Named & {
  __typename?: 'Tag';
  /** Hex color code for the tag background (e.g. #FF5733) */
  bgColor?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  /** The ID of the model */
  id: Scalars['ID']['output'];
  /** Icon or image URL for this tag */
  image?: Maybe<Scalars['String']['output']>;
  /** Instance metadata conforming to the tag definition's metaTemplate */
  meta?: Maybe<Scalars['JSONObject']['output']>;
  /** JSON schema template for tag instance metadata */
  metaTemplate?: Maybe<Scalars['JSONObject']['output']>;
  name: Scalars['String']['output'];
  /** The type of model this tag can be applied to */
  type: TagType;
  updatedAt: Scalars['DateTime']['output'];
};

/** A reusable tag definition for classifying models with custom metadata */
export type TagDefinition = Named & {
  __typename?: 'TagDefinition';
  /** Hex color code for the tag background (e.g. #FF5733) */
  bgColor?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  /** The ID of the model */
  id: Scalars['ID']['output'];
  /** Icon or image URL for this tag */
  image?: Maybe<Scalars['String']['output']>;
  /** JSON schema template for tag instance metadata */
  metaTemplate?: Maybe<Scalars['JSONObject']['output']>;
  name: Scalars['String']['output'];
  /** The type of model this tag can be applied to */
  type: TagType;
  updatedAt: Scalars['DateTime']['output'];
};

export type TagDefinitionEdge = {
  __typename?: 'TagDefinitionEdge';
  cursor: Scalars['String']['output'];
  node: TagDefinition;
};

export type TagEdge = {
  __typename?: 'TagEdge';
  cursor: Scalars['String']['output'];
  node: Tag;
};

export type TagPage = {
  __typename?: 'TagPage';
  edges?: Maybe<Array<TagEdge>>;
  nodes?: Maybe<Array<Tag>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

/** The model type of the tag */
export enum TagType {
  Component = 'COMPONENT',
  Item = 'ITEM',
  Org = 'ORG',
  Place = 'PLACE',
  Process = 'PROCESS',
  Variant = 'VARIANT'
}

/** A translated text value for a specific language */
export type TranslatedInput = {
  /** Whether this translation was generated automatically */
  auto?: Scalars['Boolean']['input'];
  /** BCP 47 language code (e.g. "en", "fr-CA") */
  lang: Scalars['String']['input'];
  text?: InputMaybe<Scalars['String']['input']>;
};

/** A translated text value for a specific language */
export type TranslatedOutput = {
  __typename?: 'TranslatedOutput';
  /** Whether this translation was generated automatically */
  auto: Scalars['Boolean']['output'];
  /** BCP 47 language code (e.g. "en", "fr-CA") */
  lang: Scalars['String']['output'];
  text?: Maybe<Scalars['String']['output']>;
};

export type UpdateCategoryInput = {
  /** Sources to associate with this change */
  addSources?: InputMaybe<Array<SourceInput>>;
  /** If true, immediately apply (merge) the change after creation */
  apply?: InputMaybe<Scalars['Boolean']['input']>;
  /** Details for a new change to create for this edit */
  change?: InputMaybe<CreateChangeInput>;
  /** ID of an existing change to add this edit to */
  changeID?: InputMaybe<Scalars['ID']['input']>;
  desc?: InputMaybe<Scalars['String']['input']>;
  descShort?: InputMaybe<Scalars['String']['input']>;
  descShortTr?: InputMaybe<Array<TranslatedInput>>;
  descTr?: InputMaybe<Array<TranslatedInput>>;
  id: Scalars['ID']['input'];
  imageURL?: InputMaybe<Scalars['String']['input']>;
  /** Language code for text input fields (BCP 47, e.g. "en") */
  lang?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  nameTr?: InputMaybe<Array<TranslatedInput>>;
  /** IDs of sources to remove from this change */
  removeSources?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type UpdateCategoryOutput = {
  __typename?: 'UpdateCategoryOutput';
  category?: Maybe<Category>;
  change?: Maybe<Change>;
};

export type UpdateChangeInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  sources?: InputMaybe<Array<Scalars['ID']['input']>>;
  status?: InputMaybe<ChangeStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateChangeOutput = {
  __typename?: 'UpdateChangeOutput';
  change?: Maybe<Change>;
};

export type UpdateComponentInput = {
  /** Sources to associate with this change */
  addSources?: InputMaybe<Array<SourceInput>>;
  addTags?: InputMaybe<Array<ComponentTagsInput>>;
  /** If true, immediately apply (merge) the change after creation */
  apply?: InputMaybe<Scalars['Boolean']['input']>;
  /** Details for a new change to create for this edit */
  change?: InputMaybe<CreateChangeInput>;
  /** ID of an existing change to add this edit to */
  changeID?: InputMaybe<Scalars['ID']['input']>;
  desc?: InputMaybe<Scalars['String']['input']>;
  descTr?: InputMaybe<Array<TranslatedInput>>;
  id: Scalars['ID']['input'];
  imageURL?: InputMaybe<Scalars['String']['input']>;
  /** Language code for text input fields (BCP 47, e.g. "en") */
  lang?: InputMaybe<Scalars['String']['input']>;
  materials?: InputMaybe<Array<ComponentMaterialInput>>;
  name?: InputMaybe<Scalars['String']['input']>;
  nameTr?: InputMaybe<Array<TranslatedInput>>;
  physical?: InputMaybe<Scalars['JSONObject']['input']>;
  primaryMaterial?: InputMaybe<ComponentMaterialInput>;
  region?: InputMaybe<ComponentRegionInput>;
  /** IDs of sources to remove from this change */
  removeSources?: InputMaybe<Array<Scalars['ID']['input']>>;
  removeTags?: InputMaybe<Array<Scalars['ID']['input']>>;
  tags?: InputMaybe<Array<ComponentTagsInput>>;
  visual?: InputMaybe<Scalars['JSONObject']['input']>;
};

export type UpdateComponentOutput = {
  __typename?: 'UpdateComponentOutput';
  change?: Maybe<Change>;
  component?: Maybe<Component>;
};

export type UpdateItemInput = {
  addCategories?: InputMaybe<Array<ItemCategoriesInput>>;
  /** Sources to associate with this change */
  addSources?: InputMaybe<Array<SourceInput>>;
  addTags?: InputMaybe<Array<ItemTagsInput>>;
  /** If true, immediately apply (merge) the change after creation */
  apply?: InputMaybe<Scalars['Boolean']['input']>;
  categories?: InputMaybe<Array<ItemCategoriesInput>>;
  /** Details for a new change to create for this edit */
  change?: InputMaybe<CreateChangeInput>;
  /** ID of an existing change to add this edit to */
  changeID?: InputMaybe<Scalars['ID']['input']>;
  desc?: InputMaybe<Scalars['String']['input']>;
  descTr?: InputMaybe<Array<TranslatedInput>>;
  id: Scalars['ID']['input'];
  imageURL?: InputMaybe<Scalars['String']['input']>;
  /** Language code for text input fields (BCP 47, e.g. "en") */
  lang?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  nameTr?: InputMaybe<Array<TranslatedInput>>;
  removeCategories?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** IDs of sources to remove from this change */
  removeSources?: InputMaybe<Array<Scalars['ID']['input']>>;
  removeTags?: InputMaybe<Array<Scalars['ID']['input']>>;
  tags?: InputMaybe<Array<ItemTagsInput>>;
};

export type UpdateItemOutput = {
  __typename?: 'UpdateItemOutput';
  change?: Maybe<Change>;
  item?: Maybe<Item>;
};

export type UpdateOrgInput = {
  /** Sources to associate with this change */
  addSources?: InputMaybe<Array<SourceInput>>;
  /** If true, immediately apply (merge) the change after creation */
  apply?: InputMaybe<Scalars['Boolean']['input']>;
  avatarURL?: InputMaybe<Scalars['String']['input']>;
  /** Details for a new change to create for this edit */
  change?: InputMaybe<CreateChangeInput>;
  /** ID of an existing change to add this edit to */
  changeID?: InputMaybe<Scalars['ID']['input']>;
  desc?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  /** Language code for text input fields (BCP 47, e.g. "en") */
  lang?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  /** IDs of sources to remove from this change */
  removeSources?: InputMaybe<Array<Scalars['ID']['input']>>;
  slug?: InputMaybe<Scalars['String']['input']>;
  websiteURL?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrgOutput = {
  __typename?: 'UpdateOrgOutput';
  change?: Maybe<Change>;
  org?: Maybe<Org>;
};

export type UpdateProcessInput = {
  /** Sources to associate with this change */
  addSources?: InputMaybe<Array<SourceInput>>;
  /** If true, immediately apply (merge) the change after creation */
  apply?: InputMaybe<Scalars['Boolean']['input']>;
  /** Details for a new change to create for this edit */
  change?: InputMaybe<CreateChangeInput>;
  /** ID of an existing change to add this edit to */
  changeID?: InputMaybe<Scalars['ID']['input']>;
  desc?: InputMaybe<Scalars['String']['input']>;
  descTr?: InputMaybe<Array<TranslatedInput>>;
  efficiency?: InputMaybe<Scalars['JSONObject']['input']>;
  id: Scalars['ID']['input'];
  instructions?: InputMaybe<Scalars['JSONObject']['input']>;
  intent?: InputMaybe<Scalars['String']['input']>;
  /** Language code for text input fields (BCP 47, e.g. "en") */
  lang?: InputMaybe<Scalars['String']['input']>;
  material?: InputMaybe<ProcessMaterialInput>;
  name?: InputMaybe<Scalars['String']['input']>;
  nameTr?: InputMaybe<Array<TranslatedInput>>;
  org?: InputMaybe<ProcessOrgInput>;
  place?: InputMaybe<ProcessPlaceInput>;
  region?: InputMaybe<ProcessRegionInput>;
  /** IDs of sources to remove from this change */
  removeSources?: InputMaybe<Array<Scalars['ID']['input']>>;
  rules?: InputMaybe<Scalars['JSONObject']['input']>;
  variant?: InputMaybe<ProcessVariantInput>;
};

export type UpdateProcessOutput = {
  __typename?: 'UpdateProcessOutput';
  change?: Maybe<Change>;
  process?: Maybe<Process>;
};

export type UpdateSourceInput = {
  content?: InputMaybe<Scalars['JSONObject']['input']>;
  contentURL?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  location?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['JSONObject']['input']>;
  type?: InputMaybe<SourceType>;
};

export type UpdateSourceOutput = {
  __typename?: 'UpdateSourceOutput';
  source?: Maybe<Source>;
};

export type UpdateTagDefinitionInput = {
  bgColor?: InputMaybe<Scalars['String']['input']>;
  desc?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  image?: InputMaybe<Scalars['String']['input']>;
  metaTemplate?: InputMaybe<Scalars['JSONObject']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<TagType>;
};

export type UpdateTagDefinitionOutput = {
  __typename?: 'UpdateTagDefinitionOutput';
  tag?: Maybe<TagDefinition>;
};

export type UpdateVariantInput = {
  addComponents?: InputMaybe<Array<VariantComponentsInput>>;
  addItems?: InputMaybe<Array<VariantItemsInput>>;
  addOrgs?: InputMaybe<Array<VariantOrgsInput>>;
  addRegions?: InputMaybe<Array<VariantRegionsInput>>;
  /** Sources to associate with this change */
  addSources?: InputMaybe<Array<SourceInput>>;
  addTags?: InputMaybe<Array<VariantTagsInput>>;
  /** If true, immediately apply (merge) the change after creation */
  apply?: InputMaybe<Scalars['Boolean']['input']>;
  /** Details for a new change to create for this edit */
  change?: InputMaybe<CreateChangeInput>;
  /** ID of an existing change to add this edit to */
  changeID?: InputMaybe<Scalars['ID']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  components?: InputMaybe<Array<VariantComponentsInput>>;
  desc?: InputMaybe<Scalars['String']['input']>;
  descTr?: InputMaybe<Array<TranslatedInput>>;
  id: Scalars['ID']['input'];
  imageURL?: InputMaybe<Scalars['String']['input']>;
  items?: InputMaybe<Array<VariantItemsInput>>;
  /** Language code for text input fields (BCP 47, e.g. "en") */
  lang?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  nameTr?: InputMaybe<Array<TranslatedInput>>;
  orgs?: InputMaybe<Array<VariantOrgsInput>>;
  region?: InputMaybe<VariantRegionsInput>;
  removeComponents?: InputMaybe<Array<Scalars['ID']['input']>>;
  removeItems?: InputMaybe<Array<Scalars['ID']['input']>>;
  removeOrgs?: InputMaybe<Array<Scalars['ID']['input']>>;
  removeRegions?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** IDs of sources to remove from this change */
  removeSources?: InputMaybe<Array<Scalars['ID']['input']>>;
  removeTags?: InputMaybe<Array<Scalars['ID']['input']>>;
  tags?: InputMaybe<Array<VariantTagsInput>>;
};

export type UpdateVariantOutput = {
  __typename?: 'UpdateVariantOutput';
  change?: Maybe<Change>;
  variant?: Maybe<Variant>;
};

/** A registered user of the platform */
export type User = {
  __typename?: 'User';
  avatarURL?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  lang?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  /** Organizations this user belongs to */
  orgs: UserOrgsPage;
  /** Extended profile information for this user */
  profile?: Maybe<UserProfile>;
  updatedAt: Scalars['DateTime']['output'];
  username: Scalars['String']['output'];
};


/** A registered user of the platform */
export type UserOrgsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type UserEdge = {
  __typename?: 'UserEdge';
  cursor: Scalars['String']['output'];
  node: User;
};

/** Membership of a user in an organization */
export type UserOrg = {
  __typename?: 'UserOrg';
  org: Org;
  /** The user's role within the organization */
  role?: Maybe<Scalars['String']['output']>;
};

export type UserOrgEdge = {
  __typename?: 'UserOrgEdge';
  cursor: Scalars['String']['output'];
  node: UserOrg;
};

export type UserOrgsPage = {
  __typename?: 'UserOrgsPage';
  edges?: Maybe<Array<UserOrgEdge>>;
  nodes?: Maybe<Array<UserOrg>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type UserPage = {
  __typename?: 'UserPage';
  edges?: Maybe<Array<UserEdge>>;
  nodes?: Maybe<Array<User>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type UserProfile = {
  __typename?: 'UserProfile';
  bio?: Maybe<Scalars['String']['output']>;
};

/** A specific variant or SKU of a product item, composed of physical components */
export type Variant = Named & {
  __typename?: 'Variant';
  /** Physical components that make up this variant */
  components: VariantComponentsPage;
  createdAt: Scalars['DateTime']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  /** Audit history of changes to this variant */
  history: Array<VariantHistory>;
  /** The ID of the model */
  id: Scalars['ID']['output'];
  imageURL?: Maybe<Scalars['String']['output']>;
  /** Product items this variant belongs to */
  items: ItemsPage;
  name?: Maybe<Scalars['String']['output']>;
  /** Organizations associated with this variant (e.g. manufacturer, importer) */
  orgs: VariantOrgsPage;
  /** Aggregated recyclability score for this variant */
  recycleScore?: Maybe<StreamScore>;
  /** Metadata tags applied to this variant */
  tags: TagPage;
  updatedAt: Scalars['DateTime']['output'];
};


/** A specific variant or SKU of a product item, composed of physical components */
export type VariantComponentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A specific variant or SKU of a product item, composed of physical components */
export type VariantItemsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A specific variant or SKU of a product item, composed of physical components */
export type VariantOrgsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A specific variant or SKU of a product item, composed of physical components */
export type VariantRecycleScoreArgs = {
  regionID?: InputMaybe<Scalars['ID']['input']>;
};


/** A specific variant or SKU of a product item, composed of physical components */
export type VariantTagsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** A physical component within a variant, with its quantity */
export type VariantComponent = {
  __typename?: 'VariantComponent';
  component: Component;
  /** Quantity of this component in the variant */
  quantity?: Maybe<Scalars['Float']['output']>;
  /** Unit of measurement for the component quantity */
  unit?: Maybe<Scalars['String']['output']>;
};

export type VariantComponentEdge = {
  __typename?: 'VariantComponentEdge';
  cursor: Scalars['String']['output'];
  node: VariantComponent;
};

export type VariantComponentsInput = {
  id: Scalars['ID']['input'];
  /** Quantity of this component in the variant */
  quantity?: InputMaybe<Scalars['Float']['input']>;
  /** Unit of measurement for the component quantity */
  unit?: InputMaybe<Scalars['String']['input']>;
};

export type VariantComponentsPage = {
  __typename?: 'VariantComponentsPage';
  edges?: Maybe<Array<VariantComponentEdge>>;
  nodes?: Maybe<Array<VariantComponent>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type VariantEdge = {
  __typename?: 'VariantEdge';
  cursor: Scalars['String']['output'];
  node: Variant;
};

export type VariantHistory = {
  __typename?: 'VariantHistory';
  changes?: Maybe<Scalars['JSONObject']['output']>;
  datetime: Scalars['DateTime']['output'];
  original?: Maybe<Scalars['JSONObject']['output']>;
  user: User;
  variant_id: Scalars['String']['output'];
};

export type VariantItemsInput = {
  id: Scalars['ID']['input'];
};

/** An organization associated with a variant and its role (e.g. manufacturer, importer) */
export type VariantOrg = {
  __typename?: 'VariantOrg';
  org: Org;
  /** The organization's role for this variant (e.g. manufacturer, importer) */
  role?: Maybe<Scalars['String']['output']>;
};

export type VariantOrgEdge = {
  __typename?: 'VariantOrgEdge';
  cursor: Scalars['String']['output'];
  node: VariantOrg;
};

export type VariantOrgsInput = {
  id: Scalars['ID']['input'];
};

export type VariantOrgsPage = {
  __typename?: 'VariantOrgsPage';
  edges?: Maybe<Array<VariantOrgEdge>>;
  nodes?: Maybe<Array<VariantOrg>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type VariantRegionsInput = {
  id: Scalars['ID']['input'];
};

export type VariantTagsInput = {
  id: Scalars['ID']['input'];
  meta?: InputMaybe<Scalars['JSONObject']['input']>;
};

export type VariantsPage = {
  __typename?: 'VariantsPage';
  edges?: Maybe<Array<VariantEdge>>;
  nodes?: Maybe<Array<Variant>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};
