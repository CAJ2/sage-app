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

export type Category = Named & {
  __typename?: 'Category';
  ancestors: CategoriesPage;
  children: CategoriesPage;
  created_at: Scalars['DateTime']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  desc_short?: Maybe<Scalars['String']['output']>;
  descendants: CategoriesPage;
  id: Scalars['ID']['output'];
  image_url?: Maybe<Scalars['String']['output']>;
  items: ItemsPage;
  name: Scalars['String']['output'];
  parents: CategoriesPage;
  updated_at: Scalars['DateTime']['output'];
};


export type CategoryAncestorsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type CategoryChildrenArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type CategoryDescendantsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type CategoryItemsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


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

export type Change = {
  __typename?: 'Change';
  created_at: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  edits: Array<Edit>;
  id: Scalars['ID']['output'];
  metadata?: Maybe<Scalars['JSONObject']['output']>;
  sources: SourcesPage;
  status: ChangeStatus;
  title?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['DateTime']['output'];
  user: User;
};


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

export type Component = Named & {
  __typename?: 'Component';
  created_at: Scalars['DateTime']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  history: Array<ComponentHistory>;
  /** The ID of the model */
  id: Scalars['ID']['output'];
  image_url?: Maybe<Scalars['String']['output']>;
  materials: Array<ComponentMaterial>;
  name?: Maybe<Scalars['String']['output']>;
  primary_material: Material;
  recycle?: Maybe<Array<ComponentRecycle>>;
  recycle_score?: Maybe<StreamScore>;
  region?: Maybe<Region>;
  tags: Array<Tag>;
  updated_at: Scalars['DateTime']['output'];
};


export type ComponentRecycleArgs = {
  region_id?: InputMaybe<Scalars['ID']['input']>;
};


export type ComponentRecycle_ScoreArgs = {
  region_id?: InputMaybe<Scalars['ID']['input']>;
};

export type ComponentEdge = {
  __typename?: 'ComponentEdge';
  cursor: Scalars['String']['output'];
  node: Component;
};

export type ComponentHistory = {
  __typename?: 'ComponentHistory';
  changes?: Maybe<Scalars['String']['output']>;
  component_id: Scalars['String']['output'];
  datetime: Scalars['DateTime']['output'];
  original?: Maybe<Scalars['String']['output']>;
};

export type ComponentMaterial = {
  __typename?: 'ComponentMaterial';
  material: Material;
  material_fraction?: Maybe<Scalars['Float']['output']>;
};

export type ComponentMaterialInput = {
  id: Scalars['ID']['input'];
  material_fraction?: InputMaybe<Scalars['Float']['input']>;
};

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

export type Container = {
  __typename?: 'Container';
  access?: Maybe<Scalars['String']['output']>;
  color?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  image_entry_point?: Maybe<ContainerImageEntryPoint>;
  shape?: Maybe<ContainerShape>;
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
  add_sources?: InputMaybe<Array<Scalars['ID']['input']>>;
  apply?: InputMaybe<Scalars['Boolean']['input']>;
  change?: InputMaybe<CreateChangeInput>;
  change_id?: InputMaybe<Scalars['ID']['input']>;
  desc?: InputMaybe<Scalars['String']['input']>;
  desc_short?: InputMaybe<Scalars['String']['input']>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  lang?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  remove_sources?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type CreateCategoryOutput = {
  __typename?: 'CreateCategoryOutput';
  category?: Maybe<Category>;
  change?: Maybe<Change>;
};

export type CreateChangeInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['JSONObject']['input']>;
  sources?: Array<Scalars['ID']['input']>;
  status?: InputMaybe<ChangeStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type CreateChangeOutput = {
  __typename?: 'CreateChangeOutput';
  change?: Maybe<Change>;
};

export type CreateComponentInput = {
  add_sources?: InputMaybe<Array<Scalars['ID']['input']>>;
  apply?: InputMaybe<Scalars['Boolean']['input']>;
  change?: InputMaybe<CreateChangeInput>;
  change_id?: InputMaybe<Scalars['ID']['input']>;
  desc?: InputMaybe<Scalars['String']['input']>;
  desc_tr?: InputMaybe<Array<TranslatedInput>>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  lang?: InputMaybe<Scalars['String']['input']>;
  materials?: InputMaybe<Array<ComponentMaterialInput>>;
  name: Scalars['String']['input'];
  name_tr?: InputMaybe<Array<TranslatedInput>>;
  primary_material?: InputMaybe<ComponentMaterialInput>;
  region?: InputMaybe<ComponentRegionInput>;
  remove_sources?: InputMaybe<Array<Scalars['ID']['input']>>;
  tags?: InputMaybe<Array<ComponentTagsInput>>;
};

export type CreateComponentOutput = {
  __typename?: 'CreateComponentOutput';
  change?: Maybe<Change>;
  component?: Maybe<Component>;
};

export type CreateItemInput = {
  add_sources?: InputMaybe<Array<Scalars['ID']['input']>>;
  apply?: InputMaybe<Scalars['Boolean']['input']>;
  categories?: InputMaybe<Array<ItemCategoriesInput>>;
  change?: InputMaybe<CreateChangeInput>;
  change_id?: InputMaybe<Scalars['ID']['input']>;
  desc?: InputMaybe<Scalars['String']['input']>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  lang?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  remove_sources?: InputMaybe<Array<Scalars['ID']['input']>>;
  tags?: InputMaybe<Array<ItemTagsInput>>;
};

export type CreateItemOutput = {
  __typename?: 'CreateItemOutput';
  change?: Maybe<Change>;
  item?: Maybe<Item>;
};

export type CreateOrgInput = {
  add_sources?: InputMaybe<Array<Scalars['ID']['input']>>;
  apply?: InputMaybe<Scalars['Boolean']['input']>;
  avatar_url?: InputMaybe<Scalars['String']['input']>;
  change?: InputMaybe<CreateChangeInput>;
  change_id?: InputMaybe<Scalars['ID']['input']>;
  desc?: InputMaybe<Scalars['String']['input']>;
  lang?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  remove_sources?: InputMaybe<Array<Scalars['ID']['input']>>;
  slug: Scalars['String']['input'];
  website_url?: InputMaybe<Scalars['String']['input']>;
};

export type CreateOrgOutput = {
  __typename?: 'CreateOrgOutput';
  change?: Maybe<Change>;
  org?: Maybe<Org>;
};

export type CreateProcessInput = {
  add_sources?: InputMaybe<Array<Scalars['ID']['input']>>;
  apply?: InputMaybe<Scalars['Boolean']['input']>;
  change?: InputMaybe<CreateChangeInput>;
  change_id?: InputMaybe<Scalars['ID']['input']>;
  desc?: InputMaybe<Scalars['String']['input']>;
  desc_tr?: InputMaybe<Array<TranslatedInput>>;
  intent: Scalars['String']['input'];
  lang?: InputMaybe<Scalars['String']['input']>;
  material?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  name_tr?: InputMaybe<Array<TranslatedInput>>;
  org?: InputMaybe<Scalars['ID']['input']>;
  place?: InputMaybe<Scalars['ID']['input']>;
  region?: InputMaybe<Scalars['ID']['input']>;
  remove_sources?: InputMaybe<Array<Scalars['ID']['input']>>;
  variant?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateProcessOutput = {
  __typename?: 'CreateProcessOutput';
  change?: Maybe<Change>;
  process?: Maybe<Process>;
};

export type CreateSourceInput = {
  content?: InputMaybe<Scalars['JSONObject']['input']>;
  content_url?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['JSONObject']['input']>;
  type: SourceType;
};

export type CreateSourceOutput = {
  __typename?: 'CreateSourceOutput';
  source?: Maybe<Source>;
};

export type CreateTagDefinitionInput = {
  bg_color?: InputMaybe<Scalars['String']['input']>;
  desc?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  meta_template?: InputMaybe<Scalars['JSONObject']['input']>;
  name: Scalars['String']['input'];
  type: TagType;
};

export type CreateTagDefinitionOutput = {
  __typename?: 'CreateTagDefinitionOutput';
  tag?: Maybe<TagDefinition>;
};

export type CreateVariantInput = {
  add_sources?: InputMaybe<Array<Scalars['ID']['input']>>;
  apply?: InputMaybe<Scalars['Boolean']['input']>;
  change?: InputMaybe<CreateChangeInput>;
  change_id?: InputMaybe<Scalars['ID']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  components?: InputMaybe<Array<VariantComponentsInput>>;
  desc?: InputMaybe<Scalars['String']['input']>;
  desc_tr?: InputMaybe<Array<TranslatedInput>>;
  items?: InputMaybe<Array<VariantItemsInput>>;
  lang?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_tr?: InputMaybe<Array<TranslatedInput>>;
  orgs?: InputMaybe<Array<VariantOrgsInput>>;
  region_id?: InputMaybe<Scalars['ID']['input']>;
  regions?: InputMaybe<Array<VariantRegionsInput>>;
  remove_sources?: InputMaybe<Array<Scalars['ID']['input']>>;
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

export type DeleteSourceOutput = {
  __typename?: 'DeleteSourceOutput';
  success?: Maybe<Scalars['Boolean']['output']>;
};

export type Edit = {
  __typename?: 'Edit';
  changes?: Maybe<EditModel>;
  entity_name: Scalars['String']['output'];
  id?: Maybe<Scalars['ID']['output']>;
  original?: Maybe<EditModel>;
};

export type EditModel = Category | Component | Item | Material | Place | Process | Region | Variant;

export type Item = Named & {
  __typename?: 'Item';
  categories: CategoriesPage;
  created_at: Scalars['DateTime']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  /** The ID of the model */
  id: Scalars['ID']['output'];
  image_url?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  tags: TagPage;
  updated_at: Scalars['DateTime']['output'];
  variants: VariantsPage;
};


export type ItemCategoriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type ItemTagsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


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

export type Material = Named & {
  __typename?: 'Material';
  ancestors: MaterialsPage;
  children: MaterialsPage;
  components: ComponentsPage;
  created_at: Scalars['DateTime']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  descendants: MaterialsPage;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  parents: MaterialsPage;
  primary_components: ComponentsPage;
  processes: ProcessPage;
  technical: Scalars['Boolean']['output'];
  updated_at: Scalars['DateTime']['output'];
};


export type MaterialAncestorsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type MaterialChildrenArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type MaterialComponentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type MaterialDescendantsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type MaterialParentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type MaterialPrimary_ComponentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


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
  deleteChange?: Maybe<DeleteChangeOutput>;
  deleteSource?: Maybe<DeleteSourceOutput>;
  markSourceProcessed?: Maybe<MarkSourceProcessedOutput>;
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


export type MutationDeleteChangeArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSourceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMarkSourceProcessedArgs = {
  id: Scalars['ID']['input'];
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

export type Org = Named & {
  __typename?: 'Org';
  avatar_url?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['DateTime']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  /** The ID of the model */
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  updated_at: Scalars['DateTime']['output'];
  users: UserPage;
  website_url?: Maybe<Scalars['String']['output']>;
};


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

export type OrgsPage = {
  __typename?: 'OrgsPage';
  edges?: Maybe<Array<OrgEdge>>;
  nodes?: Maybe<Array<Org>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Place = Named & {
  __typename?: 'Place';
  address?: Maybe<PlaceAddress>;
  created_at: Scalars['DateTime']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  location?: Maybe<PlaceLocation>;
  name?: Maybe<Scalars['String']['output']>;
  org?: Maybe<Org>;
  tags: Array<Tag>;
  updated_at: Scalars['DateTime']['output'];
};

export type PlaceAddress = {
  __typename?: 'PlaceAddress';
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  housenumber?: Maybe<Scalars['String']['output']>;
  postal_code?: Maybe<Scalars['String']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  street?: Maybe<Scalars['String']['output']>;
};

export type PlaceEdge = {
  __typename?: 'PlaceEdge';
  cursor: Scalars['String']['output'];
  node: Place;
};

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

export type Process = Named & {
  __typename?: 'Process';
  created_at: Scalars['DateTime']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  history: Array<ProcessHistory>;
  /** The ID of the model */
  id: Scalars['ID']['output'];
  intent: Scalars['String']['output'];
  material?: Maybe<Material>;
  name?: Maybe<Scalars['String']['output']>;
  org?: Maybe<Org>;
  place?: Maybe<Place>;
  region?: Maybe<Region>;
  updated_at: Scalars['DateTime']['output'];
  variant?: Maybe<Variant>;
};

export type ProcessEdge = {
  __typename?: 'ProcessEdge';
  cursor: Scalars['String']['output'];
  node: Process;
};

export type ProcessHistory = {
  __typename?: 'ProcessHistory';
  changes?: Maybe<Scalars['String']['output']>;
  datetime: Scalars['DateTime']['output'];
  original?: Maybe<Scalars['String']['output']>;
  process: Process;
  user: User;
};

export type ProcessPage = {
  __typename?: 'ProcessPage';
  edges?: Maybe<Array<ProcessEdge>>;
  nodes?: Maybe<Array<Process>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  getCategories: CategoriesPage;
  getCategory?: Maybe<Category>;
  getChange?: Maybe<Change>;
  getChanges: ChangesPage;
  getComponent?: Maybe<Component>;
  getComponentSchema?: Maybe<ModelEditSchema>;
  getComponents: ComponentsPage;
  getItem?: Maybe<Item>;
  getItems: ItemsPage;
  getMaterial?: Maybe<Material>;
  getMaterials: MaterialsPage;
  getOrg?: Maybe<Org>;
  getPlace?: Maybe<Place>;
  getPlaces: PlacesPage;
  getProcess?: Maybe<Process>;
  getProcesses: ProcessPage;
  getRegion?: Maybe<Region>;
  getRegions: RegionsPage;
  getSource?: Maybe<Source>;
  getSources: SourcesPage;
  getTag?: Maybe<Tag>;
  getTags: TagPage;
  getUser?: Maybe<User>;
  getVariant?: Maybe<Variant>;
  getVariants: VariantsPage;
  rootCategory: Category;
  rootMaterial: Material;
  search: SearchResultPage;
  searchRegionsByPoint: RegionsPage;
};


export type QueryGetCategoriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetChangeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetChangesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<ChangeStatus>;
  user_id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryGetComponentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetComponentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetItemArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetItemsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetMaterialArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetMaterialsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetOrgArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetPlaceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetPlacesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetProcessArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetProcessesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetRegionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetRegionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetSourceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetSourcesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<SourceType>;
};


export type QueryGetTagArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetTagsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetVariantArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetVariantsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QuerySearchArgs = {
  lat_long?: InputMaybe<Array<Scalars['Float']['input']>>;
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
  lat_long: Array<Scalars['Float']['input']>;
};

export type RecyclingStream = {
  __typename?: 'RecyclingStream';
  container?: Maybe<Container>;
  desc?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  score?: Maybe<StreamScore>;
  scores?: Maybe<Array<StreamScore>>;
};

export type Region = {
  __typename?: 'Region';
  bbox?: Maybe<Array<Scalars['Float']['output']>>;
  created_at: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  min_zoom?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  placetype: Scalars['String']['output'];
  updated_at: Scalars['DateTime']['output'];
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

export type SearchResultItem = Category | Component | Item | Org | Place | Region | Variant;

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
  Org = 'ORG',
  Place = 'PLACE',
  Region = 'REGION',
  Variant = 'VARIANT'
}

export type Source = {
  __typename?: 'Source';
  changes: ChangesPage;
  content?: Maybe<Scalars['JSONObject']['output']>;
  content_url?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  location?: Maybe<Scalars['String']['output']>;
  metadata?: Maybe<Scalars['JSONObject']['output']>;
  processed_at?: Maybe<Scalars['DateTime']['output']>;
  type: SourceType;
  updated_at: Scalars['DateTime']['output'];
  user: User;
};

export type SourceEdge = {
  __typename?: 'SourceEdge';
  cursor: Scalars['String']['output'];
  node: Source;
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

export type StreamContext = {
  __typename?: 'StreamContext';
  desc?: Maybe<Scalars['String']['output']>;
  key: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

export type StreamScore = {
  __typename?: 'StreamScore';
  data_quality?: Maybe<StreamScoreRating>;
  data_quality_f?: Maybe<Scalars['String']['output']>;
  max_score?: Maybe<Scalars['Float']['output']>;
  min_score?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  rating?: Maybe<StreamScoreRating>;
  rating_f?: Maybe<Scalars['String']['output']>;
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

export type Tag = Named & {
  __typename?: 'Tag';
  bg_color?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['DateTime']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  /** The ID of the model */
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  meta?: Maybe<Scalars['JSONObject']['output']>;
  meta_template?: Maybe<Scalars['JSONObject']['output']>;
  name: Scalars['String']['output'];
  type: TagType;
  updated_at: Scalars['DateTime']['output'];
};

export type TagDefinition = Named & {
  __typename?: 'TagDefinition';
  bg_color?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['DateTime']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  /** The ID of the model */
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  meta_template?: Maybe<Scalars['JSONObject']['output']>;
  name: Scalars['String']['output'];
  type: TagType;
  updated_at: Scalars['DateTime']['output'];
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

export type TranslatedInput = {
  auto?: Scalars['Boolean']['input'];
  lang: Scalars['String']['input'];
  text?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateChangeInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  metadata?: InputMaybe<Scalars['JSONObject']['input']>;
  sources?: InputMaybe<Array<Scalars['ID']['input']>>;
  status?: InputMaybe<ChangeStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateChangeOutput = {
  __typename?: 'UpdateChangeOutput';
  change?: Maybe<Change>;
};

export type UpdateComponentInput = {
  add_sources?: InputMaybe<Array<Scalars['ID']['input']>>;
  add_tags?: InputMaybe<Array<ComponentTagsInput>>;
  apply?: InputMaybe<Scalars['Boolean']['input']>;
  change?: InputMaybe<CreateChangeInput>;
  change_id?: InputMaybe<Scalars['ID']['input']>;
  desc?: InputMaybe<Scalars['String']['input']>;
  desc_tr?: InputMaybe<Array<TranslatedInput>>;
  id: Scalars['ID']['input'];
  image_url?: InputMaybe<Scalars['String']['input']>;
  lang?: InputMaybe<Scalars['String']['input']>;
  materials?: InputMaybe<Array<ComponentMaterialInput>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_tr?: InputMaybe<Array<TranslatedInput>>;
  primary_material?: InputMaybe<ComponentMaterialInput>;
  region?: InputMaybe<ComponentRegionInput>;
  remove_sources?: InputMaybe<Array<Scalars['ID']['input']>>;
  remove_tags?: InputMaybe<Array<ComponentTagsInput>>;
};

export type UpdateComponentOutput = {
  __typename?: 'UpdateComponentOutput';
  change?: Maybe<Change>;
  component?: Maybe<Component>;
};

export type UpdateItemInput = {
  add_categories?: InputMaybe<Array<ItemCategoriesInput>>;
  add_sources?: InputMaybe<Array<Scalars['ID']['input']>>;
  add_tags?: InputMaybe<Array<ItemTagsInput>>;
  apply?: InputMaybe<Scalars['Boolean']['input']>;
  change?: InputMaybe<CreateChangeInput>;
  change_id?: InputMaybe<Scalars['ID']['input']>;
  desc?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  image_url?: InputMaybe<Scalars['String']['input']>;
  lang?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  remove_categories?: InputMaybe<Array<ItemCategoriesInput>>;
  remove_sources?: InputMaybe<Array<Scalars['ID']['input']>>;
  remove_tags?: InputMaybe<Array<ItemTagsInput>>;
};

export type UpdateItemOutput = {
  __typename?: 'UpdateItemOutput';
  change?: Maybe<Change>;
  item?: Maybe<Item>;
};

export type UpdateOrgInput = {
  add_sources?: InputMaybe<Array<Scalars['ID']['input']>>;
  apply?: InputMaybe<Scalars['Boolean']['input']>;
  avatar_url?: InputMaybe<Scalars['String']['input']>;
  change?: InputMaybe<CreateChangeInput>;
  change_id?: InputMaybe<Scalars['ID']['input']>;
  desc?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  lang?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  remove_sources?: InputMaybe<Array<Scalars['ID']['input']>>;
  slug?: InputMaybe<Scalars['String']['input']>;
  website_url?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrgOutput = {
  __typename?: 'UpdateOrgOutput';
  change?: Maybe<Change>;
  org?: Maybe<Org>;
};

export type UpdateProcessInput = {
  add_sources?: InputMaybe<Array<Scalars['ID']['input']>>;
  apply?: InputMaybe<Scalars['Boolean']['input']>;
  change?: InputMaybe<CreateChangeInput>;
  change_id?: InputMaybe<Scalars['ID']['input']>;
  desc?: InputMaybe<Scalars['String']['input']>;
  desc_tr?: InputMaybe<Array<TranslatedInput>>;
  id: Scalars['ID']['input'];
  intent?: InputMaybe<Scalars['String']['input']>;
  lang?: InputMaybe<Scalars['String']['input']>;
  material?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_tr?: InputMaybe<Array<TranslatedInput>>;
  org?: InputMaybe<Scalars['ID']['input']>;
  place?: InputMaybe<Scalars['ID']['input']>;
  region?: InputMaybe<Scalars['ID']['input']>;
  remove_sources?: InputMaybe<Array<Scalars['ID']['input']>>;
  variant?: InputMaybe<Scalars['ID']['input']>;
};

export type UpdateProcessOutput = {
  __typename?: 'UpdateProcessOutput';
  change?: Maybe<Change>;
  process?: Maybe<Process>;
};

export type UpdateSourceInput = {
  content?: InputMaybe<Scalars['JSONObject']['input']>;
  content_url?: InputMaybe<Scalars['String']['input']>;
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
  bg_color?: InputMaybe<Scalars['String']['input']>;
  desc?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  image?: InputMaybe<Scalars['String']['input']>;
  meta_template?: InputMaybe<Scalars['JSONObject']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<TagType>;
};

export type UpdateTagDefinitionOutput = {
  __typename?: 'UpdateTagDefinitionOutput';
  tag?: Maybe<TagDefinition>;
};

export type UpdateVariantInput = {
  add_components?: InputMaybe<Array<VariantComponentsInput>>;
  add_items?: InputMaybe<Array<VariantItemsInput>>;
  add_orgs?: InputMaybe<Array<VariantOrgsInput>>;
  add_regions?: InputMaybe<Array<VariantRegionsInput>>;
  add_sources?: InputMaybe<Array<Scalars['ID']['input']>>;
  add_tags?: InputMaybe<Array<VariantTagsInput>>;
  apply?: InputMaybe<Scalars['Boolean']['input']>;
  change?: InputMaybe<CreateChangeInput>;
  change_id?: InputMaybe<Scalars['ID']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  desc?: InputMaybe<Scalars['String']['input']>;
  desc_tr?: InputMaybe<Array<TranslatedInput>>;
  id: Scalars['ID']['input'];
  lang?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_tr?: InputMaybe<Array<TranslatedInput>>;
  region_id?: InputMaybe<Scalars['ID']['input']>;
  remove_components?: InputMaybe<Array<VariantComponentsInput>>;
  remove_items?: InputMaybe<Array<VariantItemsInput>>;
  remove_orgs?: InputMaybe<Array<VariantOrgsInput>>;
  remove_regions?: InputMaybe<Array<VariantRegionsInput>>;
  remove_sources?: InputMaybe<Array<Scalars['ID']['input']>>;
  remove_tags?: InputMaybe<Array<VariantTagsInput>>;
};

export type UpdateVariantOutput = {
  __typename?: 'UpdateVariantOutput';
  change?: Maybe<Change>;
  variant?: Maybe<Variant>;
};

export type User = {
  __typename?: 'User';
  avatar_url?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  email_verified: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  lang?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  orgs: OrgsPage;
  profile?: Maybe<UserProfile>;
  updated_at: Scalars['DateTime']['output'];
  username: Scalars['String']['output'];
};


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

export type Variant = Named & {
  __typename?: 'Variant';
  components: ComponentsPage;
  created_at: Scalars['DateTime']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  /** The ID of the model */
  id: Scalars['ID']['output'];
  image_url?: Maybe<Scalars['String']['output']>;
  items: ItemsPage;
  name?: Maybe<Scalars['String']['output']>;
  orgs: OrgsPage;
  tags: TagPage;
  updated_at: Scalars['DateTime']['output'];
};


export type VariantComponentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type VariantItemsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type VariantOrgsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type VariantTagsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type VariantComponentsInput = {
  id: Scalars['ID']['input'];
  quantity?: InputMaybe<Scalars['Float']['input']>;
  unit?: InputMaybe<Scalars['String']['input']>;
};

export type VariantEdge = {
  __typename?: 'VariantEdge';
  cursor: Scalars['String']['output'];
  node: Variant;
};

export type VariantItemsInput = {
  id: Scalars['ID']['input'];
};

export type VariantOrgsInput = {
  id: Scalars['ID']['input'];
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
